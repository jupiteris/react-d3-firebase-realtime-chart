import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import LineChart from './chart';
import Button from '@material-ui/core/Button';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';
import firebase from '../../config/firebase';
import useDimensions from '../../utils/useDimensions';
import ActivityContainer from '../activityContainer';

const useStyles = makeStyles(theme => ({
  sidebarTitle: {
    borderBottom: '1px solid #d7d7d7',
    height: '47px',
    paddingLeft: '20px',
    fontSize: '20px',
    color: '#2f3436',
    fontWeight: '700',
    lineHeight: '47px',
  },
  root: {
    flexGrow: 1,
  },
  behaviorLabel: {
    // padding: theme.spacing(1),
    textAlign: 'left',
    fontSize: 14,
    color: '#9aa1a9',
    marginLeft: '40px',
  },
  behavior: {
    // padding: theme.spacing(1),
    fontSize: 20,
    textAlign: 'left',
    fontWeight: 'bold',
    fontFamily: 'Proxima Nova Regular, sans-serif',
    color: '#505d6f',
    marginLeft: '40px',
  },
  duration: {
    margin: 4,
  },
  icon: {
    fontSize: 20,
    marginRight: theme.spacing(1),
    color: '#505d6f',
  },
  select: {
    fontWeight: 700,
    width: 160,
    margin: '0 4px',
    lineHeight: 1.67,
    border: '1px solid #ced4da',
    fontSize: 14,
    padding: '2px 7px',
    borderRadius: 4,
    fontFamily: 'Proxima Nova Regular, sans-serif',
    color: '#525f70',
  },
  behaviorsPan: {
    padding: theme.spacing(2),
    height: 120,
    borderTop: '1px solid #e9ebf1',
    float: 'left',
  },
  noDataCaption: {
    paddingTop: '20px',
    fontFamily: 'Proxima Nova Regular, sans-serif',
    color: 'grey',
    textAlign: 'center',
  },
  behaviorItem: {
    margin: theme.spacing(1),
    padding: '0 4px',
    cursor: 'pointer',
    border: 'none',
    selected: {
      backgroundColor: 'rgba(6, 83, 151, 0.1)',
    },
  },
  fullbtn: {
    margin: theme.spacing(1),
  },
  dialogTitle: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
}));

const durationList = [
  {
    label: 'Last 7 days',
    value: 7,
  },
  {
    label: 'Last 14 days',
    value: 14,
  },
  {
    label: 'Last 30 days',
    value: 30,
  },
  {
    label: 'Last 2 months',
    value: 60,
  },
  {
    label: 'Last 1 year',
    value: 365,
  },
  {
    label: 'Custom: Select Dates...',
    value: 0,
  },
];

const DialogTitle = props => {
  const { children, onClose, ...other } = props;
  const classes = useStyles();

  return (
    <MuiDialogTitle disableTypography className={classes.dialogRoot} {...other}>
      <Typography variant="h6">{children}</Typography>
      {onClose ? (
        <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
};

const dayMiliseconds = 24 * 60 * 60 * 1000;
const colorList = ['#3d83bc', '#008eff', '#5f2dc6', '#6265f1', '#ad34fe', '#3b694e'];

const ProgressChart = ({ currentActivity, studentId, aValue }) => {
  const classes = useStyles();

  const [svgContainerRef, svgSize] = useDimensions();

  const duration = durationList[0].value;
  const [between] = useState({
    fromDate: new Date().getTime() - (durationList[0].value - 1) * dayMiliseconds,
    toDate: new Date().getTime(),
  });

  const [toggledFollowings] = useState([]);

  const [activityData, setActivityData] = useState([]);
  const [activityName, setActivityName] = useState([]);
  const [activityId, setActivityId] = useState([]);

  const [openGraph, setOpenGraph] = useState(false);
  const [graphData, setGraphData] = useState([]);

  const openGraphModal = index => {
    let target_buf = [];
    let buf = [];
    firebase
      .firestore()
      .collection('activities')
      .where('assignedStudent.studentId', '==', studentId)
      .onSnapshot(snapshot => {
        snapshot.forEach(doc => {
          if (
            doc.data().id &&
            ((doc.data().set && doc.data().set.length) ||
              (doc.data().target && doc.data().target.length))
          ) {
            let count = 0;

            if (doc.data().target && doc.data().target.length) {
              doc.data().target.forEach(element => {
                if (element.id || element.targetName) {
                  target_buf.push({ id: element.id, name: element.targetName });
                  count++;
                }
              });
            }
            if (doc.data().set && doc.data().set.length) {
              doc.data().set.forEach(element => {
                element.targets.forEach(value => {
                  if (value.id || value.targetName) {
                    target_buf.push({
                      id: value.id,
                      name: element.setName + ' : ' + value.targetName,
                    });
                    count++;
                  }
                });
              });
            }
            if (count) {
              // activities.push(doc.data().id)

              buf.push({
                activityId: doc.data().id,
                activityName: doc.data().name,
                target: target_buf,
              });
            }
            target_buf = [];
          }
        });
        setGraphData(buf);
        setOpenGraph(true);
      });
  };

  const handleCloseGraphModal = () => {
    setOpenGraph(false);
  };

  useEffect(() => {
    let mat_color = [];
    if (currentActivity) {
      mat_color.push({ id: currentActivity.id, color: colorList[0] });
    }

    const buf = [];

    firebase
      .firestore()
      .collection('activityTargetTrackingEntry')
      .where('student', '==', studentId)
      .onSnapshot(snapshot => {
        snapshot.forEach(doc => {
          if (
            doc.data().activityId === aValue &&
            doc.data().totalTrialsPercentCorrect !== 0 &&
            doc.data().dateTime &&
            doc.data().targetId &&
            doc.data().totalTrialsPresented !== 0
          ) {
            const clr = mat_color[0].color;
            buf.push({
              date: doc.data().dateTime.seconds * 1000,
              totalTrialsPercentCorrect: doc.data().totalTrialsPercentCorrect,
              clr: clr,
            });
          }
        });
        setActivityId(currentActivity.id);
        setActivityName(currentActivity.name);
        setActivityData(buf);
      });
  }, [aValue, currentActivity, studentId]);

  return (
    <>
      <div className={classes.sidebarTitle}>Progress</div>
      <Grid container>
        <Grid item xs={12}>
          <Grid container justify="space-between">
            <p
              style={{
                fontSize: '16px',
                padding: '10px 20px 4px 20px',
                margin: 0,
                fontFamily: 'Proxima Nova Regular, sans-serif',
              }}
            >
              {activityName}
            </p>
            <Button
              size="small"
              variant="contained"
              color="primary"
              disabled={activityData.length === 0 && true}
              className={classes.fullbtn}
              onClick={openGraphModal}
            >
              Full Graph
            </Button>
          </Grid>
        </Grid>
      </Grid>
      <div className={classes.root}>
        <Grid container>
          <Grid item xs={12}>
            <div ref={svgContainerRef}>
              {svgSize.width && activityData.length !== 0 ? (
                <LineChart
                  activityName={activityName}
                  data={activityData}
                  behaviors={toggledFollowings}
                  width={svgSize.width}
                  height={400}
                  colorList={colorList}
                  between={between}
                  days={duration}
                />
              ) : (
                <p className={classes.noDataCaption}>No data to display</p>
              )}
            </div>
          </Grid>
        </Grid>
      </div>
      <Dialog
        onClose={handleCloseGraphModal}
        aria-labelledby="customized-dialog-title"
        open={openGraph}
        fullScreen
      >
        <DialogTitle
          id="customized-dialog-title"
          onClose={handleCloseGraphModal}
          className={classes.dialogTitle}
        >
          Activity Graph for {activityName}
        </DialogTitle>
        <DialogContent dividers className={classes.dialogContent}>
          <div className={classes.graphContentWrapper}>
            <div className={classes.graphInnerWrapper}>
              {graphData && (
                <ActivityContainer
                  studentId={studentId}
                  activityId={activityId}
                  data={graphData}
                  colorList={colorList}
                />
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

const mapDispatchToProps = {};

const mapStateToProps = state => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withRouter(ProgressChart));
