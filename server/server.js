var express = require('express');
var app = express();
var bodyParser = require("body-parser");

var sql = require("mssql");
var cors = require('cors')
var defaultConfig = require('./config.json')
var conn;
var DBreq;


app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var services = require('./service')


connectDB();

function connectDB(){
   
     conn = new sql.ConnectionPool(defaultConfig);
     DBreq = new sql.Request(conn);


    conn.connect(err => {
        if (err) res.send(false);
        else console.log("Connected to Database ... ");

        conn.close()

    })

    sql.close();
}


app.get('/fetchAvailabiltyForDate/:date/:isMaster', (req, res) => {

    const date = req.params.date
    const isMaster = req.params.isMaster




    console.log(isMaster);

    conn.connect(err => {
        if (err) res.send("Couldnt connect to DB");

        const sql = "select * from dbo.reservation where dateBooking = '"+date +"' and tableId in (1,2,3,4,5) and cancellationStatus is null;";
        
     
        DBreq.query(sql,
        (err, recordset) => {
        
            if (err) res.send('error');

            else {
             
                if(isMaster == 'true'){
                    res.send(recordset.recordsets[0]);
                }

                else{

                    let tableData = services.fetchAvailabiltyForDate(recordset.recordsets[0]);

                    
                    console.log(recordset.recordsets[0],'recordset');

                    console.log(tableData,'tableData');

                    res.send(tableData);
                }
            }
            conn.close()
        })
    })
})


app.post('/registerBooking', (req, res) => {


    console.log(req.body)

    let tableId = req.body.tableId;
    let dateBooking = req.body.dateBooking;
    let phone = req.body.phone;
    let UserName = req.body.UserName;
    let startTime = req.body.startTime;
    let EndTime = req.body.EndTime;
   

    conn.connect((err) => {
      if (err) res.send("connection error");

      let Bid = 1;

      const regQuery =
        "select max(bookingId) as 'bookingId' from reservation ;";

      DBreq.query(regQuery, (err, dbres) => {

        if (dbres.recordset[0].bookingId) {
          Bid = dbres.recordset[0].bookingId + 1;
        }

          console.log(dbres.recordset[0].bookingId, "bookingId");

          const query =
            "insert into dbo.reservation VALUES(" +
            Bid +
            "," +
            tableId +
            ",'" +
            dateBooking +
            "','" +
            phone +
            "','" +
            UserName +
            "','" +
            startTime +
            "','" +
            EndTime +
            "',null)";

          console.log(query, "query");

          DBreq.query(query, (err, recordset) => {
            if (err) res.send(err);
            else res.send(recordset);

            conn.close();
          });
       


      });
    });

})

app.get('/fetchUserTable/:userName/:phone', (req, res) => {

    const userName = req.params.userName
    const phone = req.params.phone


    conn.connect(err => {
        if (err) res.send("Couldnt connect to DB");

        const sql = "select * from dbo.reservation where UserName = '"+userName +"' and phone = "+phone+";";
        
     
        DBreq.query(sql,
        (err, recordset) => {
        
            if (err) res.send(false);
            else {
                res.send(recordset.recordsets[0]);
            }

            conn.close()
        })
    })
})

app.put('/cancelBooking/:bookingId', (req, res) => {

    const bookingId = req.params.bookingId

    conn.connect(err => {
        if (err) res.send("Couldnt connect to DB");

        const sql = "UPDATE reservation SET cancellationStatus = 1 WHERE bookingId = "+bookingId ;
        
     
        DBreq.query(sql,
        (err, recordset) => {
        
            if (err) res.send(false);
            else {
                res.send(true);
            }

            conn.close()
        })
    })
})



var server = app.listen(5000, function () {
    console.log('Server is running..');
});