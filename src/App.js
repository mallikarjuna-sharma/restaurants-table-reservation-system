import { TextField, Typography } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import MuiDialogActions from "@material-ui/core/DialogActions";
import MuiDialogContent from "@material-ui/core/DialogContent";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import CloseIcon from "@material-ui/icons/Close";
import React, { useEffect, useState } from "react";
import DateTimePicker from "./DateTimePicker.js";
import GenerateTableComponent from "./table.js";

const axios = require("axios");

function App() {

  const [serviceURL, setserviceURL] = useState("localhost:5000");

  const [openLoginPopUp, setopenLoginPopUp] = useState(false);

  const [bookNow, setBookNow] = useState(false);

  const [openErrorPopUp, setopenErrorPopUp] = useState(false);

  const [OpenConfirmPopup, setOpenConfirmPopup] = useState(false);

  const [tableData, setTableData] = useState([]);

  const [selectedDate, setSelectedDate] = React.useState("");
  const [selectedStartTime, setSelectedStartTime] = React.useState("");
  const [selectedEndTime, setSelectedEndTime] = React.useState("");
  const [registrationForDate, setRegistrationForDate] = React.useState([]);

  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");

  const [userBooking, setUserBooking] = useState([]);

  const [openCancelPopUp, setOpenCancelPopup] = useState(false);

  useEffect(() => {

  if(bookNow) {  handleBookTable(); setBookNow(false) }

  }, [registrationForDate]);

  useEffect(() => {
    if (bookNow) {
      fetchAvailabiltyForDate(selectedDate, false);
      if(!(userPhone&&userName))  setopenLoginPopUp(true)
    }
  }, [bookNow]);

  useEffect(() => {
    if (userName && userPhone) {
      fetchAvailabiltyForDate(selectedDate, false);
      fetchUserDatils(userName, userPhone);
    }
  }, [userName, userPhone]);

  useEffect(() => {
    fetchAvailabiltyForDate(selectedDate, false);
  }, [selectedDate]);

  useEffect(() => {
    fetchAvailabiltyForDate(selectedDate, false);
  }, [selectedStartTime]);

  useEffect(() => {
    fetchAvailabiltyForDate(selectedDate, false);
  }, [selectedEndTime]);

  const getTablesThatCanBeBooked = (slotArray) => {
    // console.log(slotArray, "result");

    let result = [];

    let resultLength = [];

    let tempArr = [];
    let success = true;

    for (let i = 1; i < 6; i++) {
      tempArr = [];
      success = true;

      if (registrationForDate[i]) {
        registrationForDate[i].forEach((e) => {
          tempArr.push(...e);
        });

        slotArray.forEach((e) => {
          if (tempArr.indexOf(e) > -1) {
            success = false;
            return;
          }
        });

        if (success) {
          result.push(i);
          resultLength.push(tempArr.length);
        }
      } else {
        if (success) {
          result.push(i);
          resultLength.push(tempArr.length);
        }
      }
    }

    console.log(result, "result");
    console.log(resultLength, "result");

    return [result, resultLength];
  };

  const canTableBooked = () => {
    let startSlot = getSlotsForStartTime(selectedStartTime);
    let endSlot = getSlotsForEndTime(selectedEndTime);

    let slotArray = getBetweenSlots(startSlot, endSlot);

    console.log(selectedStartTime, "registrationForDate");

    console.log(selectedEndTime, "registrationForDate");

    console.log(registrationForDate, "registrationForDate");
    console.log(slotArray, "registrationForDate");

    const tables = getTablesThatCanBeBooked(slotArray);

    const indexOfmaxValues = tables[1].indexOf(Math.max(...tables[1]));

    const bookTable = tables[0][indexOfmaxValues];

    console.log(bookTable, "bookTable");
    registerBooking(bookTable);
  };

  const registerBooking = (tableNumber) => {
    const bookingDetails = {
      tableId: tableNumber,
      dateBooking: selectedDate,
      phone: userPhone,
      UserName: userName,
      startTime: selectedStartTime,
      EndTime: selectedEndTime,
    };

    axios
      .post("http://" + serviceURL + "/registerBooking", bookingDetails)
      .then(function (response) {
        if (response && response.data && response.data.rowsAffected[0] == 1) {
          console.log("booked success");
          if (userName && userPhone) fetchUserDatils(userName, userPhone);
        }
      })
      .catch(function (error) {});
  };

  const handleBookTable = () => {
    // console.log( new Date( selectedDate.split('-')[0], selectedDate.split('-')[1], selectedDate.split('-')[2])  < new Date() )

    if (!(userName && userPhone)) setopenLoginPopUp(true);
    else if (!(selectedDate && selectedStartTime && selectedEndTime))
      setopenErrorPopUp(true);
    else if (selectedStartTime < 18 || selectedEndTime < 18)
      setopenErrorPopUp(true);
    else if (selectedStartTime > selectedEndTime) setopenErrorPopUp(true);
    // else if( new Date( selectedDate.split('-')[0], selectedDate.split('-')[1], selectedDate.split('-')[2])  > new Date()  )
    //     setopenErrorPopUp(true)
    else canTableBooked();
  };

  const fetchUserDatils = (userName, userPhone) => {
    axios
      .get(
        "http://" + serviceURL + "/fetchUserTable/" + userName + "/" + userPhone
      )
      .then(function (response) {
        console.log(response.data, "fetchUserTable");
        if (response && response.data) {
          setUserBooking(response.data);
        }
      })
      .catch(function (error) {});
  };

  const fetchAvailabiltyForDate = (selectedDate, isMaster) => {
    axios
      .get(
        "http://" +
          serviceURL +
          "/fetchAvailabiltyForDate/" +
          selectedDate +
          "/" +
          isMaster
      )
      .then(function (response) {
        console.log(response, "fetchAvailabiltyForDate");

        if (response && !isMaster) setRegistrationForDate(response.data);
        else if (isMaster) setTableData(response.data);
        else setRegistrationForDate(false);
      })
      .catch(function (error) {});
  };

  const cancelBooking = (bId) => {
    console.log(bId, "cancel booking");

    axios
      .put("http://" + serviceURL + "/cancelBooking/" + bId)
      .then(function (response) {
        console.log(response.data, "fetchUserTable");
        if (response && response.data) {
          fetchUserDatils(userName, userPhone);
        }
      })
      .catch(function (error) {});
  };

  const handleBookNow = () => {
    if (bookNow) {
      fetchAvailabiltyForDate(selectedDate, false);
      if(!(userPhone&&userName))  setopenLoginPopUp(true)
    }
  }

  return (
    <Grid container justify="center" spacing={4}>
      {openCancelPopUp && (
        <CancelPopUp
          setOpenCancelPopup={(e) => {
            if (e) cancelBooking(openCancelPopUp);

            setOpenCancelPopup(false);
          }}
        />
      )}

      {OpenConfirmPopup && (
        <ConfirmPopUp
          setOpenConfirmPopup={(e) => {
            if (e) setBookNow(true);
            setOpenConfirmPopup(false);
          }}
        />
      )}

      <Grid item>
        <Typography
          variant="h3"
          style={{
            fontSize: "72px",
            background: "-webkit-linear-gradient(#499F92, #333)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Hello ,
          {userName
            ? userName
            : tableData && tableData.length
            ? "Admin"
            : "Guest"}
        </Typography>
      </Grid>

      <DateTimePicker
        setSelectedDate={(e) => setSelectedDate(e)}
        setSelectedStartTime={(e) => setSelectedStartTime(e)}
        setSelectedEndTime={(e) => setSelectedEndTime(e)}
      />

      {openLoginPopUp && (
        <LoginPopUp
          setopenLoginPopUp={(e) => setopenLoginPopUp(e)}
          sentUser={(e) => {
            if (userName && userPhone) setTableData([]);
            setUserName(e[0]);
            setUserPhone(e[1]);
            setTableData([]);
          }}
        />
      )}

      {openErrorPopUp && (
        <ErrorPopUp setopenErrorPopUp={(e) => setopenErrorPopUp(e)} />
      )}

      <Grid item md={2} xs={12} sm={12}>
        <StyledButtonBlue onClick={() => {setBookNow(true); handleBookNow();} } disabled={false}>
          {userName ? "Complete Booking" : "Log in to Book"}
        </StyledButtonBlue>
      </Grid>

      {userName && (
        <Grid item md={2} xs={12} sm={12}>
          <StyledButtonBlue onClick={() => setopenLoginPopUp(true)}>
            Log In as Different User
          </StyledButtonBlue>
        </Grid>
      )}

      <Grid item md={2} xs={12} sm={12}>
        <StyledButtonBlue
          onClick={() => {
            setUserName("");
            setUserPhone("");
            setUserBooking([]);
            fetchAvailabiltyForDate(selectedDate, true);
          }}
        >
          I'm Admin
        </StyledButtonBlue>
      </Grid>

      {(tableData && tableData.length) ||
      (userBooking && userBooking.length) ? (
        <Grid item md={11} xs={11} sm={11} lg={11}>
          <GenerateTableComponent
            columns={[
              {
                id: userBooking.length ? "bookingId" : "tableId",
                label: userBooking.length ? "Your Booking Id" : "Table Number",
              },
              { id: "dateBooking", label: "When" },
              { id: "startTime", label: "From" },
              { id: "EndTime", label: "To" },
              {
                id: userBooking.length ? "cancellationStatus" : "UserName",
                label: userBooking.length ? "Drop Plan" : "Who",
              },
            ]}
            tableData={userBooking.length ? userBooking : tableData}
            cancelBookingId={(e) => setOpenCancelPopup(e)}
          />
        </Grid>
      ) : (null)}
    </Grid>
  );
}

const styles = (theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(2),
  },
  closeButton: {
    position: "absolute",
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
});

const StyledButtonBlue = withStyles({
  root: {
    background: "linear-gradient(45deg, #93CFC2 30%, #136F7E 90%)",
    borderRadius: 3,
    border: 0,
    color: "white",
    height: 48,
    padding: "0 30px",
    boxShadow: "0 3px 5px 2px rgba(255, 105, 135, .3)",
  },
  label: {
    textTransform: "capitalize",
  },
})(Button);

const DialogTitle = withStyles(styles)((props) => {
  const { children, classes, onClose, ...other } = props;
  return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      <Typography variant="h6">{children}</Typography>
      {onClose ? (
        <IconButton
          aria-label="close"
          className={classes.closeButton}
          onClick={onClose}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
});

const DialogContent = withStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}))(MuiDialogContent);

const DialogActions = withStyles((theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(1),
  },
}))(MuiDialogActions);

const LoginPopUp = (props) => {
  const { setopenLoginPopUp, sentUser } = props;

  const [username, setusername] = useState("");
  const [phone, setphone] = useState("");

  return (
    <Dialog onClose={() => setopenLoginPopUp(false)} open={1}>
      <DialogTitle
        id="customized-dialog-title"
        onClose={() => setopenLoginPopUp(false)}
        style={{
          background: "linear-gradient(45deg, #93CFC2 30%, #136F7E 90%)",
        }}
      >
        Enter Username
      </DialogTitle>
      <DialogContent dividers>
        <Grid container>
          <TextField
            id={"Username"}
            type={"string"}
            key={100}
            required
            label={"Enter Username"}
            value={username}
            color="primary"
            onChange={(e) => {
              setusername(e.target.value);
            }}
          />
          <Grid container>
            <TextField
              id={"phone"}
              type={"phone"}
              key={100}
              required
              label={"Enter phone Number"}
              value={phone}
              color="primary"
              onChange={(e) => {
                setphone(e.target.value);
              }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <StyledButtonBlue
          onClick={(e) => {
            if (username && phone) {
              sentUser([username, phone]);
              setopenLoginPopUp(false);
            }
          }}
        >
          Login
        </StyledButtonBlue>
      </DialogActions>
    </Dialog>
  );
};

const CancelPopUp = (props) => {
  const { setOpenCancelPopup } = props;

  return (
    <Dialog onClose={() => setOpenCancelPopup(false)} open={1}>
      <DialogTitle
        id="customized-dialog-title"
        onClose={() => setOpenCancelPopup(false)}
        style={{
          background: "linear-gradient(45deg, #93CFC2 30%, #136F7E 90%)",
        }}
      >
        Do you want to Cancel ?
      </DialogTitle>

      <DialogActions>
        <StyledButtonBlue
          onClick={(e) => {
            setOpenCancelPopup(true);
          }}
        >
          Confirm Cancel
        </StyledButtonBlue>

        <StyledButtonBlue
          onClick={(e) => {
            setOpenCancelPopup(false);
          }}
        >
          Stop
        </StyledButtonBlue>
      </DialogActions>
    </Dialog>
  );
};

const ErrorPopUp = (props) => {
  const { setopenErrorPopUp } = props;

  return (
    <Dialog onClose={() => setopenErrorPopUp(false)} open={1}>
      <DialogTitle
        id="customized-dialog-title"
        onClose={() => setopenErrorPopUp(false)}
        style={{
          background: "linear-gradient(45deg, #93CFC2 30%, #136F7E 90%)",
        }}
      >
        Operated Between 6 PM - 12 PM
      </DialogTitle>
    </Dialog>
  );
};

const ConfirmPopUp = (props) => {
  const { setOpenConfirmPopup } = props;

  return (
    <Dialog onClose={() => setOpenConfirmPopup(false)} open={1}>
      <DialogTitle
        id="customized-dialog-title"
        onClose={() => setOpenConfirmPopup(false)}
        style={{
          background: "linear-gradient(45deg, #93CFC2 30%, #136F7E 90%)",
        }}
      >
        Can I Book ?
      </DialogTitle>

      <DialogActions>
        <StyledButtonBlue
          onClick={(e) => {
            setOpenConfirmPopup(true);
          }}
        >
          Confirm
        </StyledButtonBlue>

        <StyledButtonBlue
          onClick={(e) => {
            setOpenConfirmPopup(false);
          }}
        >
          No !
        </StyledButtonBlue>
      </DialogActions>
    </Dialog>
  );
};

const useStylesSnack = makeStyles((theme) => ({
  rootsnack: {
    width: "100%",
    "& > * + *": {
      marginTop: theme.spacing(2),
    },
  },
}));

function getSlotsForStartTime(startTime) {
  switch (startTime) {
    case "18.0":
      return 1;
    case "18.30":
      return 2;
    case "19.0":
      return 3;
    case "19.30":
      return 4;
    case "20.0":
      return 5;
    case "20.30":
      return 6;
    case "21.0":
      return 7;
    case "21.30":
      return 8;
    case "22.0":
      return 9;
    case "22.30":
      return 10;
    case "23.0":
      return 11;
    case "23.30":
      return 12;
  }
}

function getSlotsForEndTime(endTime) {
  switch (endTime) {
    case "18.30":
      return 1;
    case "19.0":
      return 2;
    case "19.30":
      return 3;
    case "20.0":
      return 4;
    case "20.30":
      return 5;
    case "21.0":
      return 6;
    case "21.30":
      return 7;
    case "22.0":
      return 8;
    case "22.30":
      return 9;
    case "23.0":
      return 10;
    case "23.30":
      return 11;
    case "24.0":
      return 12;
  }
}

function getBetweenSlots(startSlot, endSlot) {
  if (startSlot === endSlot) return [endSlot];
  else {
    let slotsArr = [];
    for (let i = startSlot; i <= endSlot; i++) slotsArr.push(i);
    return slotsArr;
  }
}

export default App;
