import React, { useState, useEffect, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import ToggleButton from '@material-ui/lab/ToggleButton';
import firebase from '../../config/firebase';
import useDimensions from '../../utils/useDimensions';
import LineChart from './chart';
import './index.css';

import DateRangePicker from 'react-bootstrap-daterangepicker';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-daterangepicker/daterangepicker.css';
import Select from '@material-ui/core/Select';
import SettingsIcon from '@material-ui/icons/Settings';
import MenuItem from '@material-ui/core/MenuItem';
import FreeScrollBar from 'react-free-scrollbar';

const UpperFirst = str =>
  str.toLowerCase().replace(/(^|\s)\S/g, firstLetter => firstLetter.toUpperCase());

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

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  },
  behaviorLabel: {
    textAlign: 'left',
    fontSize: 14,
    color: '#9aa1a9',
    marginLeft: '40px',
  },
  behavior: {
    fontSize: 20,
    textAlign: 'left',
    fontWeight: 'bold',
    fontFamily: 'Proxima Nova Regular, sans-serif',
    color: '#505d6f',
    marginLeft: '40px',
  },
  duration: {
    width: '100% !important',
    margin: 4,
  },
  icon: {
    fontSize: 20,
    marginRight: theme.spacing(1),
    color: '#505d6f',
  },
  select: {
    fontWeight: 700,
    margin: '0 4px',
    lineHeight: 1.67,
    border: '1px solid #ced4da',
    fontSize: 14,
    padding: '2px 7px',
    borderRadius: 4,
    width: '100%',
    fontFamily: 'Proxima Nova Regular, sans-serif',
    color: '#525f70',
  },
  selectDuration: {
    fontWeight: 700,
    margin: '0 4px',
    width: 240,
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
  behaviorItem: {
    margin: theme.spacing(1),
    padding: '0 4px',
    cursor: 'pointer',
    border: 'none',
    selected: {
      backgroundColor: 'rgba(6, 83, 151, 0.1)',
    },
  },
  rangepicker: {
    width: '100%',
  },
}));

const formatTime = date => {
  let year = date.getFullYear();
  let month = date.getMonth();
  let day = date.getDate();
  return year.toString() + '-' + (parseInt(month.toString()) + 1) + '-' + day.toString();
};

const perMilliseconds = 1000;
const dayMilliSeconds = 24 * 60 * 60 * 1000;

const ActivityContainer = ({ studentId, activityId, data, colorList }) => {
  const classes = useStyles();
  const [svgContainerRef, svgSize] = useDimensions();
  const [activities, setActivities] = useState([]);
  const [activityValue, setActivityValue] = useState(activityId);
  const [duration, setDuration] = useState(durationList[1].value);
  const [between, setBetween] = useState({
    fromDate: new Date().getTime() - (durationList[1].value - 1) * dayMilliSeconds,
    toDate: new Date().getTime(),
  });
  const [currentTargets, setCurrentTargets] = useState(
    data.filter(e => e.activityId === activityId)[0].target,
  );
  const [toggledFollowings, setToggledFollowings] = useState([]);
  const [selected, setSelected] = useState(false);
  const [activityData, setActivityData] = useState([]);
  const [targetData, setTargetData] = useState([]);
  const [colorMap, setColorMap] = useState([]);
  const [act_targets_data, setActTargetsData] = useState([]);
  const [observerName, setObserverName] = useState('')
  const dateRef = useRef();

  const re_render = () => {
    getActRelations(activityValue)
  }

  useEffect(() => {
    let bufActivities = [];
    let mat_color = [];
    data.forEach(element => {
      bufActivities.push({ id: element.activityId, name: element.activityName });
      element.target.forEach((target, j) => {
        mat_color.push({id: target.id, color: colorList[j]})
      })
    });
    
    getActRelations(activityValue)
    setColorMap(mat_color);
    setActivities(bufActivities);
    getObserverName(activityValue);

  }, [data]);

  const getActRelations = (activityValue) => {
    const targets_buf = [];
    const buf = [];
    firebase
      .firestore()
      .collection('activityTargetTrackingEntry')
      .where('student', '==', studentId)
      .onSnapshot(snapshot => {
        snapshot.forEach(doc => {
          if (
            doc.data().activityId === activityValue &&
            doc.data().dateTime &&
            doc.data().targetId &&
            doc.data().totalTrialsPresented !== null &&
            doc.data().totalTrialsPresented !== 0 &&
            doc.data().totalTrialsPercentCorrect !== null &&
            !doc.data().isArchived
          ) {
            targets_buf.push({
              date: doc.data().dateTime.seconds * perMilliseconds,
              totalTrialsPercentCorrect: doc.data().totalTrialsPercentCorrect,
              target_id: doc.data().targetId,
              target_name: doc.data().targetName,
              targetEntryId: doc.data().id,
            });
            const clr = '#08bcc1';
            buf.push({
              date: doc.data().dateTime.seconds * perMilliseconds,
              totalTrialsPercentCorrect: doc.data().totalTrialsPercentCorrect,
              clr: clr,
            });
          }
        });
        setActTargetsData(targets_buf);
        setActivityData(buf);
      });
  }

  const getObserverName = activityValue => {
    let observer = ''
    firebase
      .firestore()
      .collection('activityTrackingEntry')
      .onSnapshot(snapshot => {
        snapshot.forEach(doc => {
          if(doc.data().activityId === activityValue){
            observer = doc.data().observer
            if(observer === '' || !observer) setObserverName('');
            else
              firebase
                .firestore()
                .collection('proctors')
                .onSnapshot(snapshot => {
                  snapshot.forEach(d => {
                    if(d.data().email === observer){
                      if(!d.data().name || d.data().name === '') setObserverName('');
                      else setObserverName(d.data().name)
                    }
                })
              })
          }
        })
      })
  }

  const onChangeDuration = value => {
    if (value.target.value) {
      setBetween({
        fromDate: new Date().getTime() - (value.target.value - 1) * dayMilliSeconds,
        toDate: new Date().getTime(),
      });
    } else {
      dateRef.current.click();
    }
    setDuration(value.target.value);
  };

  const onChangeActivityValue = value => {

    getActRelations(value.target.value)
    setToggledFollowings([]);
    setActivityValue(value.target.value);
    getObserverName(value.target.value)

    data.forEach(element => {
      if (element.activityId === value.target.value) {
        setCurrentTargets(element.target);
      }
    });
  };

  const onChangeDateRange = (event, picker) => {
    setBetween({
      fromDate: picker.startDate._d.getTime(),
      toDate: picker.endDate._d.getTime(),
    });
    setDuration(0);
  };

  useEffect(() => {
    let toggledList = [...toggledFollowings];
    updateTargetData(toggledList);
  }, [activityData]);

  const updateTargetData = data => {
    let toggledList = [...data];
    const buf = [];
    toggledList.forEach(element => {
      buf.push(act_targets_data.filter(d => d.target_id === element));
    });
    setTargetData(buf);
  }

  const onToggleTarget = id => {
    let toggledList = [...toggledFollowings];
    if (toggledList.includes(id)) {
      toggledList = toggledList.filter(e => e !== id);
    } else {
      toggledList.push(id);
    }
    setToggledFollowings(toggledList);
    setSelected(!selected);
    updateTargetData(toggledList);
  };


  const flag = toggledFollowings.length ? true : false;

  return (
    <div className={classes.root}>
      <Grid container>
        <Grid item xs={12} container sm={4} md={3} lg={5} xl={5}>
          <Grid item xs={12} sm={7} md={10} lg={5} xl={5} className={classes.behavior}>
            <Grid container justify="center" alignItems="center">
              <Select
                value={activityValue}
                className={classes.select}
                onChange={onChangeActivityValue}
              >
                {activities.map(a => (
                  <MenuItem key={a.id} value={a.id}>
                    {a.name}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
          </Grid>
        </Grid>
        <Grid container justify="flex-end" item xs={12} sm={8} md={9} lg={7} xl={7}>
          <div className={classes.duration}>
            <Grid container justify="flex-end" alignItems="center" spacing={1}>
              <Grid item xs={12} sm={6} md={5} lg={5} xl={4}>
                <Grid container justify="flex-end" alignItems="center" spacing={1}>
                  <SettingsIcon type="setting" className={classes.icon} />
                  <Select
                    value={duration}
                    className={classes.selectDuration}
                    onChange={onChangeDuration}
                  >
                    {durationList.map((d, i) => (
                      <MenuItem key={i} value={d.value}>
                        {d.label}
                      </MenuItem>
                    ))}
                  </Select>
                </Grid>
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3} xl={3}>
                <Grid container justify="center" spacing={0}>
                  <DateRangePicker
                    onApply={onChangeDateRange}
                    startDate={new Date(between.fromDate)}
                    endDate={new Date(between.toDate)}
                    showDropdowns
                  >
                    <input
                      type="text"
                      className="form-control"
                      ref={dateRef}
                      value={
                        formatTime(new Date(between.fromDate)) +
                        ' -- ' +
                        formatTime(new Date(between.toDate))
                      }
                      readOnly
                    />
                  </DateRangePicker>
                </Grid>
              </Grid>
            </Grid>
          </div>
        </Grid>
        <Grid item xs={12}>
          <div ref={svgContainerRef}>
            {svgSize.width && (
              <LineChart
                data={flag ? targetData : [activityData]}
                width={svgSize.width}
                height={500}
                topMargin={svgSize.top}
                colorList={colorList}
                between={between}
                days={duration}
                observerName={observerName}
                re_render={re_render}
                flag={flag}
                colorMap={colorMap}
              />
            )}
          </div>
        </Grid>
        <Grid item xs={12} className={classes.behaviorsPan}>
          <FreeScrollBar>
            <Grid container>
              {currentTargets.map((e, i) => (
                <Grid key={e.id}>
                  <Grid container justify="center">
                    <ToggleButton
                      value="behavior"
                      selected={toggledFollowings.includes(e.id ? e.id : i)}
                      onClick={() => onToggleTarget(e.id ? e.id : i)}
                      className={classes.behaviorItem}
                    >
                      <span style={{ color: colorList[i] }}>&#11044;</span>&nbsp;
                      {UpperFirst(e.name)}
                    </ToggleButton>
                  </Grid>
                </Grid>
              ))}
            </Grid>
          </FreeScrollBar>
        </Grid>
      </Grid>
    </div>
  );
};

export default ActivityContainer;
