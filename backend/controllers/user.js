const {
  JWTSECTRET,
  JWTEXPIRATION,
  BCRYPTSALTROUNDS,
  HTTP_STATUS_OK,
  HTTP_STATUS_CREATED,
  HTTP_STATUS_BAD_REQUEST,
  HTTP_STATUS_NOT_FOUND,
  HTTP_STATUS_UNAUTHORIZED,
  HTTP_STATUS_CONFLICT,
  HTTP_STATUS_INETERNAL_SERVER_ERROR,
  HTTP_STATUS_UNPROCESSABLE_CONTENT,
  SEQ_DB_ERR,
  SEQ_UNIQUE_CONSTRAINT_ERR,
} = require("../util/const");

const { isEmpty } = require("../util/helper");
const { User } = require("../models/main");
const logger = require("../util/log");



exports.filterUsers = async (req, res, next) => {
  try {
    let users = new Array(0);
    if (isEmpty(req.query)) {
      users = await User.findAll();
    } else {
      try {
        users = await User.findAll({ where: req.query });
      } catch (err) {
        if (err.name === SEQ_DB_ERR) {
          err.message = "Invalid query string.";
          err.statusCode = HTTP_STATUS_BAD_REQUEST;
          throw err;
        }
      }
    }
    for (const user of users) {
      // do not disclose pwd, even if hashed
      user.setDataValue("pwd", null);
    }

    res.status(HTTP_STATUS_OK).json(users);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = HTTP_STATUS_INETERNAL_SERVER_ERROR;
    }
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    let countDeletedUsers = 0;
    let httpStatus = HTTP_STATUS_NOT_FOUND;
    if (!isEmpty(req.params.id)) {
      countDeletedUsers = await User.destroy({
        where: { id: req.params.id },
      });
    }
    if (countDeletedUsers != 0) {
      httpStatus = HTTP_STATUS_OK;
    }
    res.status(httpStatus).json({ usersDeleted: countDeletedUsers });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = HTTP_STATUS_INETERNAL_SERVER_ERROR;
    }
    next(err);
  }
};


