import React, { memo, useState, useEffect, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import PermIdentityIcon from '@material-ui/icons/PermIdentity';
import ScheduleIcon from '@material-ui/icons/Schedule';
import DeleteIcon from '@material-ui/icons/Delete';
import Tooltip from '@material-ui/core/Tooltip';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import './index.css';
import moment from 'moment'
import firebase from '../../config/firebase';

const size = {
  width: 200,
  height: 175,
};

const useStyles = makeStyles(theme => ({
  divider: {
    borderTop: '1px solid #ccc',
  },
  edtbtn: {
    width: 70,    
    backgroundColor: '#3d83bc',
    '&:hover': {
      backgroundColor: '#3d83bc',
    },
    textTransform: "none"
  },
  deleteWrapper: {
    color: '#4c5956',
    padding: 7,
  },
  deleteQuiz: {
    fontSize: '17px',
    fontWeight: 'bold',
  },
  cancel: {
    height: '50px',
    width: '100%',
    padding: '2px',
    textDecoration: 'underline',
    textTransform: "none"
  },
  cancel_edit: {
    height: '30px',
    width: '80%',
    padding: '2px',
    textDecoration: 'underline',
    textTransform: "none"
  },
  delbtn: {
    width: 80,
    color: 'red',
    marginTop: 4,
    textTransform: "none"
  },
  yes_btn:{
    height: '50px',
    width: '100%',
    padding: '2px',
    color: 'white',
    backgroundColor: '#3d8ccb',
    textTransform: "none"
  },
  yes_edit:{
    height: '30px',
    width: '80%',
    padding: '2px',
    color: 'white',
    backgroundColor: '#3d8ccb',
    textTransform: "none"
  },
  deleteConfirm:{
    border: '1px solid #e3e3e3',
    borderRadius: '4px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
    padding: '0.5rem 0.5rem',
    width: '60%'
  },
  customWidth:{
    maxWidth: '300px',
    fontSize: '14px',
    backgroundColor: 'yellow',
    color: 'black'
  }
}));

const editText = `
Cumulative graph data points may not be edited as they are 
roll-up summation fields from targets. Edit the child targets
to have changes reflected.
`;

const deleteText = `
Cumulative graph data points may not be deleted as they are 
roll-up summation fields from targets. Edit the child targets
to have changes reflected.
`;


const EditModal = memo(({ info }) => {
  const classes = useStyles();
  const [d_flag, setDFlag] = useState(false)
  const [e_flag, setEFlag] = useState(false)
  const [text, setText] = useState('')
  const [score, setScore] = useState(0)
  const deleteRef = useRef()
  const updateRef = firebase.firestore().collection('activityTargetTrackingEntry');

  useEffect(() => {
    setDFlag(false)
    setScore(parseFloat(info.data.score).toFixed(2))
  },[info])
  
  const handleDeletePopper = () => {
    setDFlag(true)
  }

  const handleCancel = () => {
    setDFlag(false)
    setEFlag(false)
  }

  const handleChange = (e) => {
    setText(e.target.value)    
  }

  const handleEdit = () => {
    setEFlag(true)
  }

  const handleScoreChange = (e) => {
    if(parseFloat(e.target.value) > 100 || parseFloat(e.target.value) < 0)
      setScore(score)
    else
      setScore(parseFloat(e.target.value).toFixed(2))
  }

  const handleDeleteYes = () => {
    if(text.toLowerCase() === 'delete'){
      info.targetsPerDay.forEach(element => {
        updateRef.doc(element)
          .update({
            isArchived: true
          })
          .then((docRef) => {
            console.log('success')            
            setDFlag(false)
            info.show = false
            info.re_render()
          })
          .catch((error) => {
            console.log(error)
          })
      });      
    }      
    else  
      deleteRef.current.value="Please Again"
  }

  const handleEditYes = () => {
    const loginUserName = 'panda'
    info.targetsPerDay.forEach((element, index) => {
      if(index === 0)
        updateRef.doc(element)
          .update({
            totalTrialsCorrect: null,
            totalTrialsIncorrect: null,
            totalTrialsPercentCorrect: parseFloat(score),
            totalTrialsPresented: -1,
            modifiedBy: loginUserName,
            modifiedDate: firebase.firestore.Timestamp.fromDate(new Date())
          })
          .then((docRef) => {
            console.log('success')     
          })
          .catch((error) => {
            console.log(error)
          })
      else
        updateRef.doc(element)
        .update({
          totalTrialsCorrect: null,
          totalTrialsIncorrect: null,
          totalTrialsPercentCorrect: null,
          totalTrialsPresented: null,
          modifiedBy: loginUserName,
          modifiedDate: firebase.firestore.Timestamp.fromDate(new Date())
        })
        .then((docRef) => {
          console.log('success') 
        })
        .catch((error) => {
          console.log(error)
        })
    });
    setDFlag(false)
    info.show = false
    info.re_render()
  }

  return (
    <>
      <Grid
        container
        spacing={1}
        direction="column"
        className={`tip-${info.dir}`}
        style={{        
          left: info.dir === 'left' ? info.x : info.x - size.width,  
          visibility: !e_flag && !d_flag && info.show ? "visible" : "hidden",      
          top: info.y - size.height / 2,
          width: size.width,
          height: size.height,
          color: '#a0a3a3',        
          fontSize: 12
        }}
      >
        <Grid item style={{marginLeft: 4, marginTop: 8}}>
          <span style={{ color: info.color }}>&nbsp;&nbsp;⬤</span>
          &nbsp;&nbsp;&nbsp;{parseFloat(info.data.score).toFixed(2)}%
        </Grid>
        <Grid item style={{marginLeft: 4}}>
          <PermIdentityIcon /> {info.observerName}
        </Grid>
        <Grid item style={{marginLeft: 4}}>
          <ScheduleIcon /> {moment(info.data.date).format('LT')}
        </Grid>
        <Grid item className={classes.divider}>
          <Grid container justify="space-around" alignItems="center">
            <Tooltip title={editText} 
              disableTouchListener={!info.targetName? false : true} 
              disableHoverListener={!info.targetName? false : true} 
              classes={{ tooltip: classes.customWidth }}
            ><span>
              <Button 
                size="small" variant="contained" 
                color="primary" className={classes.edtbtn} 
                disabled={!info.targetName? true : false}
                onClick={handleEdit}
              >
                Edit
              </Button></span>
            </Tooltip>
            <Tooltip 
              title={deleteText} 
              disableTouchListener={!info.targetName? false : true} 
              disableHoverListener={!info.targetName? false : true} 
              classes={{ tooltip: classes.customWidth }}  
            ><span>
              <Button 
                size="small" className={classes.delbtn} 
                onClick={handleDeletePopper} 
                disabled={!info.targetName? true : false}
              >
                <DeleteIcon />
                Delete
              </Button></span>
            </Tooltip>
          </Grid>
        </Grid>
      </Grid>
      <div
        className='delete-modal'
        style={{
          left: info.dir === 'left' ? info.x : info.x - 330, 
          top: info.y - 100,
          visibility: d_flag ? "visible" : "hidden",
          width: 420,
        }}
      >
        <Grid container spacing={1} className={classes.deleteWrapper}>
          <Grid item xs={12} className={classes.deleteQuiz} container justify="center" alignItems="center">
              Are you Sure?
          </Grid>
          <Grid item xs={12} container justify="center" alignItems="center">
            Please confirm you want to delete the data point on<br/>
            <b>&nbsp;{moment(info.data.date).format('D-MMMM-YYYY')}&nbsp;</b> for Target <b>&nbsp;{info.targetName}&nbsp;</b>.
          </Grid>
          <Grid item xs={12} container justify="center" alignItems="center">
            Please type <span style={{color: 'red', fontWeight: 'bold'}}>&nbsp;Delete&nbsp;</span> in the field below.
          </Grid>
          <Grid item xs={12} container justify="center" alignItems="center">
            <input type='text' className={classes.deleteConfirm} onChange={handleChange} ref={deleteRef}></input>
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={1} justify="center">
              <Grid container item xs={4}></Grid>
              <Grid container item xs={4}>
                <Button size="small" className={classes.cancel} onClick={handleCancel}>
                  No, Go Back
                </Button>
              </Grid>
              <Grid container item xs={4} justify="center" alignItems="center">
                <Button
                    size="small"
                    variant="contained"
                    color="default"             
                    className={classes.yes_btn}
                    onClick={handleDeleteYes}
                  >
                    Yes, Delete Data
                </Button>
              </Grid>
            </Grid>            
          </Grid>        
        </Grid>
      </div>
      <div
        className='edit-modal'
        style={{
          left: info.dir === 'left' ? info.x : info.x - 330, 
          top: info.y - 100,
          visibility: e_flag ? "visible" : "hidden",
          width: 320,
        }}
      >
        <Grid container spacing={1} className={classes.deleteWrapper}>
          <Grid item xs={12} className={classes.deleteQuiz} container justify="center" alignItems="center">
              Response Correctness 
          </Grid>
          <Grid item xs={12} container justify="center" alignItems="center">
            <TextField
              id="outlined"
              type="number"
              InputLabelProps={{shrink: true,}}
              variant="outlined"
              helperText={score? "" : "Required"}
              error={score? false : true}
              onChange={handleScoreChange}
              value={score}
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              }}
              inputProps={{ min: "0", max: "100", step: "0.05" }}
            />
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={1} >
              <Grid container item xs={6} justify="center" alignItems="center">
                <Button size="small" className={classes.cancel_edit} onClick={handleCancel}>
                  Cancel
                </Button>
              </Grid>
              <Grid container item xs={6} justify="center" alignItems="center">
                <Button
                    size="small"
                    variant="contained"
                    color="default"             
                    className={classes.yes_edit}
                    onClick={handleEditYes}
                  >
                    Save
                </Button>
              </Grid>
            </Grid>            
          </Grid>        
        </Grid>
      </div>
    </>
  );
});

export default EditModal;
