import React, { useState, useEffect } from "react";
import firebase from "../../config/firebase";
import { makeStyles } from '@material-ui/core/styles';
import CssBaseline from "@material-ui/core/CssBaseline";
import Container from "@material-ui/core/Container";
import ChartContainer from "../../components/chartContainer";
import ActivityContainer from "../../components/activityContainer";
import ProgressChart from "../../components/progressChart";

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing(2),
    height: '100vh'
  }  
}));

function App() {
  
  const classes = useStyles();  
  
  // const data = [
  //   {
  //     behaviorId: '4gyNJ40Pd9XADl0Pj4hL',
  //     behaviorName: 'patrick test 1',
  //     behaviorData: [
  //       {date: 1571106400, score: 4},
  //       {date: 1571300000, score: 3},
  //       {date: 1571410000, score: 4},
  //       {date: 1571520000, score: 6},
  //       {date: 1571756400, score: 7},
  //       {date: 1572060000, score: 4},
  //       {date: 1572270000, score: 2},
  //       {date: 1572580000, score: 4},
  //       {date: 1572786400, score: 6},
  //       {date: 1573090000, score: 7},
  //       {date: 1573380000, score: 8},
  //       {date: 1573690000, score: 9},
  //       {date: 1574186400, score: 3},
  //       {date: 1574290000, score: 2},
  //       {date: 1574500000, score: 5},
  //       {date: 1574810000, score: 2},
  //     ],
  //     phaseLines: [1574118562, 1573118562 , 1572518562]
  //   },
  //   {
  //     behaviorId: '3ad2q8oEx6Ndp0swRPXN',
  //     behaviorName: 'anton test 1',
  //     behaviorData: [
  //       {date: 1571106400, score: 3},
  //       {date: 1571300000, score: 5},
  //       {date: 1571410000, score: 2},
  //       {date: 1571520000, score: 3},
  //       {date: 1571756400, score: 5},
  //       {date: 1572060000, score: 8},
  //       {date: 1572270000, score: 3},
  //       {date: 1572580000, score: 3},
  //       {date: 1572786400, score: 5},
  //       {date: 1573090000, score: 5},
  //       {date: 1573380000, score: 5},
  //       {date: 1573690000, score: 2},
  //       {date: 1574186400, score: 8},
  //       {date: 1574290000, score: 3},
  //       {date: 1574500000, score: 6},
  //       {date: 1574810000, score: 4},
  //     ],
  //     phaseLines: [1574118562, 1573118562 , 1572518562]
  //   },
  //   {
  //     behaviorId: '4gyNJ40Pd9XAdsfds0Pj4hL',
  //     behaviorName: 'uyiuyu test 1',
  //     behaviorData: [
  //       {date: 1571106400, score: 8},
  //       {date: 1571300000, score: 4},
  //       {date: 1571410000, score: 3},
  //       {date: 1571520000, score: 7},
  //       {date: 1571756400, score: 4},
  //       {date: 1572060000, score: 5},
  //       {date: 1572270000, score: 2},
  //       {date: 1572580000, score: 3},
  //       {date: 1572786400, score: 2},
  //       {date: 1573090000, score: 8},
  //       {date: 1573380000, score: 3},
  //       {date: 1573690000, score: 8},
  //       {date: 1574186400, score: 7},
  //       {date: 1574290000, score: 7},
  //       {date: 1574500000, score: 2},
  //       {date: 1574810000, score: 3},
  //     ],
  //     phaseLines: [1574118562, 1573118562 , 1572518562]
  //   },
  //   {
  //     behaviorId: '3ad2q8osdfsdfdp0swRPXN',
  //     behaviorName: 'fgjhfhg test 1',
  //     behaviorData: [
  //       {date: 1571106400, score: 3},
  //       {date: 1571300000, score: 2},
  //       {date: 1571410000, score: 4},
  //       {date: 1571520000, score: 6},
  //       {date: 1571756400, score: 7},
  //       {date: 1572060000, score: 8},
  //       {date: 1572270000, score: 4},
  //       {date: 1572580000, score: 6},
  //       {date: 1572786400, score: 8},
  //       {date: 1573090000, score: 2},
  //       {date: 1573380000, score: 1},
  //       {date: 1573690000, score: 5},
  //       {date: 1574186400, score: 8},
  //       {date: 1574290000, score: 3},
  //       {date: 1574500000, score: 4},
  //       {date: 1574810000, score: 3},
  //     ],
  //     phaseLines: [1574118562, 1573118562 , 1572518562]
  //   },
  //   {
  //     behaviorId: '4gysdfsdgd9XADl0Pj4hL',
  //     behaviorName: 'sdfsd test 1',
  //     behaviorData: [
  //       {date: 1571106400, score: 7},
  //       {date: 1571300000, score: 3},
  //       {date: 1571410000, score: 1},
  //       {date: 1571520000, score: 5},
  //       {date: 1571756400, score: 3},
  //       {date: 1572060000, score: 2},
  //       {date: 1572270000, score: 7},
  //       {date: 1572580000, score: 3},
  //       {date: 1572786400, score: 9},
  //       {date: 1573090000, score: 5},
  //       {date: 1573380000, score: 3},
  //       {date: 1573690000, score: 8},
  //       {date: 1574186400, score: 4},
  //       {date: 1574290000, score: 7},
  //       {date: 1574500000, score: 1},
  //       {date: 1574810000, score: 7},
  //     ],
  //     phaseLines: [1574118562, 1573118562 , 1572518562]
  //   },
  //   {
  //     behaviorId: '3ad2q8oEx6NsdfsdfRPXN',
  //     behaviorName: 'bvnv test 1',
  //     behaviorData: [
  //       {date: 1571106400, score: 6},
  //       {date: 1571300000, score: 5},
  //       {date: 1571410000, score: 5},
  //       {date: 1571520000, score: 3},
  //       {date: 1571756400, score: 6},
  //       {date: 1572060000, score: 5},
  //       {date: 1572270000, score: 5},
  //       {date: 1572580000, score: 3},
  //       {date: 1572786400, score: 6},
  //       {date: 1573090000, score: 5},
  //       {date: 1573380000, score: 5},
  //       {date: 1573690000, score: 3},
  //       {date: 1574186400, score: 6},
  //       {date: 1574290000, score: 5},
  //       {date: 1574500000, score: 5},
  //       {date: 1574810000, score: 3},
  //     ],
  //     phaseLines: [1574518562, 1572118562 , 1573518562]
  //   }
  // ]

  const colorList = []

  for (let index = 0; index < 20; index++) 
    colorList.push('#' + (Math.random().toString(16) + "000000").substring(2,8))


  // const[data, setData] = useState()

  const[a_data, setAData] = useState()

  // real code to get the data from firebase

 

  useEffect(() => {
    // let behaviorIds = []
    // let behaviorNames = []

    // firebase
    //   .firestore()
    //   .collection("behaviors")
    //   .onSnapshot(snapshot => {
    //     snapshot.forEach(doc => {
    //       if (
    //         doc.data().assignedStudent &&
    //         doc.data().assignedStudent.studentId ===
    //           "d8b9b488212401954b9d75a719405cc7" &&
    //         doc.data().isArchived === false &&
    //         doc.data().measureName === 'Frequency'
    //       ) {
    //         if(doc.data().id){
    //           behaviorIds.push(doc.data().id)
    //           behaviorNames.push(doc.data().name)
    //         }
    //       }
    //     });
    //   });

    // let buffer = [];
    // let t_buffer = [];
    // firebase
    //   .firestore()
    //   .collection("behaviorTrackingEntry")
    //   .onSnapshot(snapshot => {
    //     snapshot.forEach(doc => {
    //       if (
    //         // doc.data().behavior === "giihgKpI3uzBzHeHNC1y" &&
    //         doc.data().student === "d8b9b488212401954b9d75a719405cc7"
    //       ) {
    //         buffer.push({
    //           behaviorId: doc.data().behavior,
    //           date: doc.data().startDateTime.seconds,
    //           score: doc.data().freqScore
    //         });
    //       }
    //     });
    //     behaviorIds.forEach((e, index) => {
    //       const buf = buffer.filter((ele) => ele.behaviorId === e)
    //       t_buffer.push({behaviorId: e, behaviorName: behaviorNames[index], behaviorData: buf})
    //     })
    //     setData(t_buffer);
    //   });

    let target_buf = []
    let buf = []
    let activities = []
    // const a_Data = [
    //   {
    //     activityId: '',
    //     activityName: '',
    //     target: [],
    //     // target: [
    //     //   {
    //     //     id: '',
    //     //     data: []
    //     //   }
    //     // ]
    //   }
    // ]

    firebase
      .firestore()
      .collection("activities")
      .onSnapshot(snapshot => {
        snapshot.forEach(doc => {
          if (
            doc.data().assignedStudent &&
            doc.data().assignedStudent.studentId ===
              "f91978f1783921cef3e86facfdc1c4c1" 
          ) {
            if(doc.data().id && doc.data().target && doc.data().target.length){
              let count = 0
              doc.data().target.forEach(element => {
                if(element.id && element.targetName){
                  target_buf.push({id: element.id, name: element.targetName})
                  count ++
                }
              });
              if(count){
                // activities.push(doc.data().id)
                buf.push({activityId: doc.data().id, activityName: doc.data().name, target: target_buf})
              }
              target_buf = []
            }
          }
        });
        setAData(buf)
        buf = []
      });


      // firebase
      // .firestore()
      // .collection("activityTargetTrackingEntry")
      // .onSnapshot(snapshot => {
      //   snapshot.forEach(doc => {
      //     if (
      //       doc.data().assignedStudent &&
      //       doc.data().assignedStudent.studentId ===
      //         "f91978f1783921cef3e86facfdc1c4c1" &&
      //       doc.data().activityId === 'mJrj49deR5PlivpBzMZV'
      //     ) console.log('jhe')
      //     else console.log(doc.data())
      //   })
      // });

      
    
  }, []);

  return (
    <React.Fragment>
      <CssBaseline />
      <Container maxWidth="xl" className={classes.root}>
        {
          a_data && 
          // <ProgressChart
          //             studentId={'f91978f1783921cef3e86facfdc1c4c1'}
          //             currentActivity={'ZJxV8auXeuIMRDAVmBaS'}
          //             aValue={'ZJxV8auXeuIMRDAVmBaS'}
          //           />
          // <ChartContainer data={data} colorList={colorList} />
          <ActivityContainer 
            data={a_data} 
            colorList={colorList} 
            studentId={'f91978f1783921cef3e86facfdc1c4c1'} 
            activityId={"mJrj49deR5PlivpBzMZV"}
          />//ZJxV8auXeuIMRDAVmBaS, mJrj49deR5PlivpBzMZV
        }  
        <div></div>              
      </Container>
    </React.Fragment>
  );
}

export default App;
