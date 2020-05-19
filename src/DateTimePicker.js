import "date-fns";
import React, { useEffect } from "react";
import DateFnsUtils from "@date-io/date-fns";
import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
  KeyboardDatePicker,
} from "@material-ui/pickers";
import { Grid, Typography } from "@material-ui/core";

export default function DateTimePicker(props) {
  // The first commit of Material-UI

  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const [selectedStartTime, setSelectedStartTime] = React.useState(new Date());
  const [selectedEndTime, setSelectedEndTime] = React.useState(new Date());

  useEffect(() => {
    const formatDate =
      selectedDate.getFullYear() +
      "-" +
      "0"+
      (parseInt(selectedDate.getMonth())+1) +
      "-" +
      selectedDate.getDate();

    props.setSelectedDate(formatDate);
  }, [selectedDate]);

  useEffect(() => {
    console.log('here')
    const hours =
      selectedStartTime.getHours() == 12 ? 24 : selectedStartTime.getHours();
    const min = selectedStartTime.getMinutes() > 30 ? 30 : 0;
    const time = hours + "." + min;

    props.setSelectedStartTime(time);
  }, [selectedStartTime]);

  useEffect(() => {
    let hours =
      selectedEndTime.getHours() == 12 ? 24 : selectedEndTime.getHours();
    let min = 0;

    if (selectedEndTime.getMinutes() > 30) {
      hours += 1;
    } else {
      min = 30;
    }

    const time = hours + "." + min;

    props.setSelectedEndTime(time);
  }, [selectedEndTime]);

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <Grid container justify="center" spacing={2}>

        <Grid item>
        <KeyboardDatePicker
          disableToolbar
          variant="inline"
          format="MM/dd/yyyy"
          margin="normal"
          id="date-picker-inline"
          label="Select Date"
          value={selectedDate}
          onChange={(e) => {
            setSelectedDate(e);
          }}
          KeyboardButtonProps={{
            "aria-label": "change date",
          }}
        />
        </Grid>
        <Grid item>
        <KeyboardTimePicker
          margin="normal"
          id="time-picker"
          label="Select Start  Time "
          value={selectedStartTime}
          onChange={(e) => {
            setSelectedStartTime(e);
          }}
          KeyboardButtonProps={{
            "aria-label": "change time",
          }}
        /></Grid>
   <Grid item>
        <KeyboardTimePicker
          margin="normal"
          id="time-picker"
          label="Select End Time "
          value={selectedEndTime}
          onChange={(e) => {
            setSelectedEndTime(e);
          }}
          KeyboardButtonProps={{
            "aria-label": "change time",
          }}
        />
        </Grid>
      </Grid>
    </MuiPickersUtilsProvider>
  );
}
