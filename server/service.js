


function getSlotsForStartTime(startTime){

    switch(startTime){

        case "18.0":return 1;
        case "18.30":return 2;
        case "19.0":return 3;
        case "19.30":return 4;
        case "20.0":return 5;
        case "20.30":return 6;
        case "21.0":return 7;
        case "21.30":return 8;
        case "22.0":return 9;
        case "2.30":return 10;
        case "23.0":return 11;
        case "23.30":return 12;

    }

}


function getSlotsForEndTime(endTime){

    switch(endTime){

        case "18.30":return 1;
        case "19.0":return 2;
        case "19.30":return 3;
        case "20.0":return 4;
        case "20.30":return 5;
        case "21.0":return 6;
        case "21.30":return 7;
        case "22.0":return 8;
        case "22.30":return 9;
        case "23.0":return 10;
        case "23.30":return 11;
        case "24.0":return 12;

    }

}

function getBetweenSlots(startSlot,endSlot){

    if(startSlot === endSlot) return [endSlot];
    else    
        {
            let slotsArr = [];
            for(let i = startSlot ; i <= endSlot ; i++)
                    slotsArr.push(i)
            return slotsArr;
        }

}


//  [
//     {
//       bookingId: '1',
//       tableId: 1,
//       dateBooking: '2020-05-15',
//       phone: '809987',
//       UserName: 'kedar',
//       startTime: '6',
//       EndTime: '8'
//     },
//     {
//       bookingId: '2',
//       tableId: 1,
//       dateBooking: '2020-05-15',
//       phone: '809987',
//       UserName: 'kedar',
//       startTime: '10',
//       EndTime: '12'
//     }
//   ]

function fetchAvailabiltyForDate(response){

    let obj = {
        "1" : [],
        "2" : [],
        "3" : [],
        "4" : [],
        "5" : []
    }


    if(response)
    response.forEach(element => {

        let startSlot = getSlotsForStartTime(element.startTime) ;
        let endSlot = getSlotsForEndTime(element.EndTime) ;

        let slotArray = getBetweenSlots(startSlot,endSlot);

        obj[element.tableId.toString()].push(slotArray);

    })


    return obj;

    console.log('send',obj)

}


module.exports = {fetchAvailabiltyForDate}



