import userModel from "../models/User.js";
import Auth from "../common/auth.js";
import sendEmail from "../common/sendMail.js";
import Token from "../models/token.js";
import Randomstring from "randomstring";

const getUserById = async (req, res) => {
  try {
    let user = await userModel.findOne({ _id: req.params.id });
    res.status(200).send({
      message: "User Fetched Successfully",
      user,
    });
  } catch (error) {
    res.status(500).send({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const create = async (req, res) => {
  try {
    let user = await userModel.findOne({ email: req.body.email });
    if (!user) {
      req.body.password = await Auth.hashPassword(req.body.password);
      await userModel.create(req.body);
      res.status(201).send({
        message: "User Created Successfully",
      });
    } else {
      res
        .status(400)
        .send({ message: `User with ${req.body.email} already exists` });
    }
  } catch (error) {
    res.status(500).send({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const editUserById = async (req, res) => {
  try {
    let user = await userModel.findOne({ _id: req.params.id });
    if (user) {
      let {newpassword, password } = req.body;
      let hashCompare = await Auth.hashCompare(
        req.body.password,
        user.password
      )
      if(hashCompare){
        req.body.newpassword = await Auth.hashPassword(req.body.newpassword);
        user.password = req.body.newpassword;
        await user.save();
      res.status(200).send({ message: "Password changed Successfully" });
    } 
    else{
      res.send({message:" Existing Password is wrong"})
    }
    } else {
      res.status(400).send({ message: "Invalid User" });
    }
  } catch (error) {
    res.status(500).send({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const addUserdetailsById = async (req, res) => {
  try {
    let user = await userModel.findOne({ _id: req.params.id });
    if (user) {
      await userModel.updateOne(
        { _id: req.params.id },
        {
          $set: req.body,
        }
      );
      res.status(200).send({
        message: "User Details added",
      });
    } else {
      res.status(400).send({ message: "Invalid User" });
    }
  } catch (error) {
    res.status(500).send({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const deleteUserById = async (req, res) => {
  try {
    let user = await userModel.findOne({ _id: req.params.id });
    if (user) {
      let hashCompare = await Auth.hashCompare(
        req.body.password,
        user.password
      )
      if(hashCompare){
      await userModel.deleteOne({ _id: req.params.id });
      res.status(200).send({ message: "User Deleted Successfully" });
    } 
    else{
      res.send({ message: "Invalid password" });
    }
  }
  else {
      res.status(400).send({ message: "Invalid User" });
    }
  } catch (error) {
    res.status(500).send({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    let user = await userModel.findOne({ email: req.body.email });
    if (user) {
      let hashCompare = await Auth.hashCompare(
        req.body.password,
        user.password
      );
      if (hashCompare) {
        let token = await Auth.createToken({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          id: user._id,
        });
        res.status(200).send({
          message: "Login Successfull",
          token,
          id: user._id,
        });
      } else {
        res.status(400).send({
          message: `Invalid Password`,
        });
      }
    } else {
      res.status(400).send({
        message: `Account with ${req.body.email} does not exists!`,
      });
    }
  } catch (error) {
    res.status(500).send({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const forgetPassword = async (req, res) => {
  try {
    await Token.deleteMany();
    const user = await userModel.findOne({ email: req.body.email });

    if (user) {
      let token = await Token.findOne({ userId: user._id });
      if (!token) {
        token = await new Token({
          userId: user._id,
          token: `${Randomstring.generate({
            length: 7,
            charset: "alphabetic",
          })}`,
        }).save();
      }
      console.log(user);
      res.send({
        token,
        message: "ok",
        email: `${req.body.email}`,
      });
      await sendEmail(user.email, "Password reset", token.token);
    } else {
      res
        .status(400)
        .send({ message: `User with ${req.body.email} does not exists` });
    }
  } catch (error) {
    res.status(500).send({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const token = await Token.findOne();
    const Id = token.userId;
    let user = await userModel.findOne({ _id: Id });
    if (Id.toString() != user._id.toString()) {
      return res.send("userId doesn't match");
    }
    const key = token.token;
    const key1 = req.body.token;
    if (key != key1) {
      return res.send("Reset key doesn't match");
    }
    req.body.password = await Auth.hashPassword(req.body.password);
    user.password = req.body.password;
    await user.save();
    await Token.deleteOne();
    res.status(200).send({ message: "Password reset successfully." });
  } catch (error) {
    console.error(error);
    return res.status(500).send(error.message);
  }
};

const suggestColor = async (req, res) => {
  try {
    const userId = req.params.id;
    let user = await userModel.findOne({ _id: userId });

    if (user) {
      function parseArrayString(arrayString) {
        try {
          if (typeof arrayString === "string") {
            // If arrayString is a string, attempt to parse it
            return JSON.parse(arrayString.replace(/'/g, '"'));
          } else if (Array.isArray(arrayString)) {
            // If arrayString is already an array, return it as is
            return arrayString;
          } else {
            console.error(`Invalid arrayString format: ${arrayString}`);
            return [];
          }
        } catch (error) {
          console.error(`Error parsing array string: ${arrayString}`);
          console.error(error);
          return [];
        }
      }

      function getRandomDressColor() {
        const dressColors = parseArrayString(user.dresscolor);
        const randomIndex = Math.floor(Math.random() * dressColors.length);
        return dressColors[randomIndex];
      }

      async function addValueField() {
        let selectedColor;
        let recentColorsArray = parseArrayString(user.recentColors);
        const dressColors = parseArrayString(user.dresscolor);
      
        // Try to find a dress color that is not present in recentColorsArray
        const availableDressColors = dressColors.filter(
          (color) => !recentColorsArray.includes(color)
        );
      
        // Filter out the last three values from recentColorsArray
        const lastThreeColors = recentColorsArray.slice(-3);
      
        if (recentColorsArray.length >= 3) {
          do {
            // If recentColorsArray has three or more colors, compare with the last three colors
            if (availableDressColors.length > 0) {
              // If there are available colors excluding the last three, select one randomly
              const randomIndex = Math.floor(
                Math.random() * availableDressColors.length
              );
              selectedColor = availableDressColors[randomIndex];
            } else {
              // If no available colors excluding the last three, select a random dress color
              selectedColor = getRandomDressColor();
            }
      
            // Check if the selected color matches the last three colors
          } while (lastThreeColors.includes(selectedColor));
        } else {
          // If recentColorsArray has less than three colors, select a color without comparison
          if (availableDressColors.length > 0) {
            const randomIndex = Math.floor(
              Math.random() * availableDressColors.length
            );
            selectedColor = availableDressColors[randomIndex];
          } else {
            selectedColor = getRandomDressColor();
          }
        }
      
        user.value = selectedColor;
      
        recentColorsArray.push(selectedColor);
      
        if (recentColorsArray.length > 7) {
          recentColorsArray.shift();
        }
      
        user.recentColors = recentColorsArray;
      
        await user.save();
      
        return selectedColor;
      }
      

      const selectedColor = await addValueField();
      res
        .status(200)
        .send({
          message: "Color value saved successfully",
          selectedColor,
          user,
        });
    } else {
      res.status(404).send({ message: "User not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export default {
  create,
  getUserById,
  editUserById,
  deleteUserById,
  login,
  addUserdetailsById,
  resetPassword,
  forgetPassword,
  suggestColor,
};
