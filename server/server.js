var express = require('express');
var app = express();
var bodyParser = require("body-parser");

var sql = require("mssql");
var cors = require('cors')
var defaultConfig = require('./config.json')
var userconfig;
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


app.get('/check', (req, res) => {
    res.send(true)
})
app.get('/home/:name', (req, res) => {
    res.send("reached" + req.params.name)
})

app.post('/connectDB', function (req, res) {



    let user = req.body.dbDetails.user;
    let password = req.body.dbDetails.password;
    let server = req.body.dbDetails.server;
    let database = req.body.dbDetails.database;

    // config for your database
    userconfig = {
        user: user,
        password: password,
        server: server,
        database: database,
        connectionLimit: 15,
        queueLimit: 30,
        acquireTimeout: 1000000
    };
    //     var config = {
    //     user: 'sa',
    //     password: 'reallyStrongPwd123',
    //     server: "localhost",
    //     database: 'Mallik',
    //     connectionLimit: 15,
    //     queueLimit: 30,
    //     acquireTimeout: 1000000
    // };

     conn = new sql.ConnectionPool( userconfig ? userconfig : defaultConfig);
     DBreq = new sql.Request(conn);


    conn.connect(err => {
        if (err) res.send(false);
        else res.send(true);

        conn.close()

    })

    sql.close();

});

app.post('/fetchUserDetails', (req, res) => {

    let user = req.body.username;
    let password = req.body.password;

    conn.connect(err => {
        if (err) res.send(false);
        console.log('db connected')
        const sql = "select userid FROM userstable where username = '"+user+"' and password = '"+password +"' ";
        DBreq.query(sql,
        (err, recordset) => {
        
            if (err) res.send(false);
            else res.send(recordset);

            conn.close()
        })

    })

})


app.get('/createTable', (req, res) => {


    conn.connect(err => {
        if (err) res.send(false);
        console.log('db connected')

        DBreq.query('CREATE TABLE userstable(userid int not null,username varchar(20) not null,password  varchar(20) not null,primary key (userid));create table category(cid int not null ,category_name varchar(20) not null ,primary key (cid));CREATE TABLE projects(pid int not null,"project title"  varchar(20) not null,userid  int not null,cid  int not null,FOREIGN KEY (userid) REFERENCES userstable(userid),FOREIGN KEY (cid) REFERENCES category(cid),primary key (pid));', 
        (err, recordset) => {



            if (err) res.send(false);
            else res.send(recordset);

            conn.close()
        })

    })

})




app.get('/fetchAllUserDetails', (req, res) => {

    conn.connect(err => {
        if (err) res.send(false);
        console.log('db connected')


        DBreq.query("select projects.[project title],category.category_name," +
            "userstable.username, userstable.password " +
            "from projects LEFT JOIN " +
            "userstable on userstable.userid = projects.userid " +
            "LEFT JOIN " +
            "category on category.cid = projects.cid; ",
            function (err, recordset)  {

           

                if (err) res.send(false);
                else res.send(recordset);

                res.end();

                conn.close()
            })
    })

})


app.get('/fetchUserIdDetails/:userId', (req, res) => {

    let userId = req.params.userId;


    conn.connect(err => {
        if (err) res.send(false);
        console.log('db connected')
        const sql = " select projects.[project title], category.category_name , "+
                        "userstable.username "+
                        "from projects LEFT JOIN "+
                        "userstable on userstable.userid= projects.userid "+
                      "  LEFT JOIN "+
                       " category on category.cid = projects.cid "+
                        " where projects.userid = "+userId;
        DBreq.query(sql,
        (err, recordset) => {
        
            if (err) res.send(false);
            else res.send(recordset);

            conn.close()
        })

    })
})
app.get('/insertTable', (req, res) => {

   

    conn.connect(err => {
        if (err) res.send(false);
        console.log('db connected')

       DBreq.query("insert into userstable values( 1,'mallik','12345'),(2,'other','2354'); insert into category values (1,'literature'),(2,'science'), (3,'engineering'),(4,'history'); insert into projects values(9,'testing hist2',2,4),(10,'testing hist3',2,4),(1,'testing lit',1,1),(2,'testing science',1,2),(3,'testing engineering',1,3),(4,'testing hist',1,4),(5,'testing lit',2,1),(6,'testing science',2,2),(7,'testing engineering',2,3),(8,'testing hist',2,4); ",
            
        (err, recordset) => {

                if (err) res.send(false);
                else res.send(recordset);

                conn.close()
            })
        })

})

var server = app.listen(5000, function () {
    console.log('Server is running..');
});