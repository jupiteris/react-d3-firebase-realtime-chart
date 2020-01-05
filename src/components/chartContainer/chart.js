import React, { useRef, useEffect, useState } from "react";
import Popper from '@material-ui/core/Popper';
import Paper from '@material-ui/core/Paper';
import Fade from '@material-ui/core/Fade';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import DeleteIcon from '@material-ui/icons/Delete';
import Button from '@material-ui/core/Button';
import * as d3 from "d3";
import moment from 'moment'

const formatTime = d3.timeFormat("%b-%d");

const useStyles = makeStyles(theme => ({
  typography: {
    padding: theme.spacing(1),
    width: '250px',
  },
  info: {
    margin: '10px 0px',
    padding: theme.spacing(1),
    borderBottom: '2px solid #dde1d5',
    borderTop: '2px solid #dde1d5'
  }
}));

const LineChart = ({ data, width, height, behaviors, between, days, studentName }) => {
  console.log(days)
  const svgRef = useRef();
  const [anchorEl, setAnchorEl] = useState(null);
  const [b_name, setBName] = useState('');
  const [info, setInfo] = useState({})
  const classes = useStyles();
  const popperRef = useRef()
  const arrowRef = useRef()

  useEffect(() => {

    d3.select(svgRef.current)
      .selectAll("*")
      .remove();
    
    const margin = { top: 10, right: 20, bottom: 50, left: 50 },
      w = width - margin.left - margin.right,
      h = height - margin.top - margin.bottom;

    const svg = d3
      .select(svgRef.current)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);      

    if (!behaviors || data.length === 0) {
      svg.append("text")
        .attr("x", w/2)
        .attr("y", h/2)
        .attr("text-anchor", "middle")
        .attr('stroke','red')
        .attr("font-size", 10)
        .attr("fill", "#fff")
        .text('No data in the period you selected');
      
      return
    }    

    let v_datas = [],
      filtered = [],
      phaseLines = [],
      behaviorName = [];
    const offset = -new Date().getTimezoneOffset() / 60;
    if (between) {
      for (let i = 0; i < data.length; i++) {
        filtered = data[i].behaviorData
          .filter(d => d.date >= between.fromDate && d.date <= between.toDate)
          .sort((a, b) => (a.date < b.date ? -1 : 0));

        if(!filtered || !filtered.length) continue

        let baseDate = moment(filtered[0].date - offset * 60 * 60 * 1000).format("MMM Do YY");
        let baseTime = filtered[0].date
        let sum_d = 0
        let s_day = []

        filtered.forEach((element, index) => {
          if(moment(element.date - offset * 60 * 60 * 1000).format("MMM Do YY") === baseDate){
            sum_d += element.score
            if(index === filtered.length - 1)
              s_day.push({date: baseTime, score: sum_d, clr:element.clr})
          }
          else{
            s_day.push({date: baseTime, score: sum_d, clr:element.clr})
            baseDate = moment(element.date - offset * 60 * 60 * 1000).format("MMM Do YY")
            baseTime = element.date
            sum_d = element.score
            if(index === filtered.length - 1)
              s_day.push({date: baseTime, score: sum_d, clr:element.clr})
          }
        });

        v_datas.push(s_day);
        behaviorName.push(data[i].behaviorName)

        if(!data[i].phaseLines || data[i].phaseLines === []) continue
        else phaseLines[i] = data[i].phaseLines.filter(e => e * 1000 >= between.fromDate && e * 1000 <= between.toDate).sort((a,b) => a < b ? -1 : 0)
      }
    } else return;    

    let averScores = [];
    //get the offset between current time zone and default time zone
    
    console.log(v_datas)

    if(!v_datas.length) {
      svg.append("text")
        .attr("x", w/2)
        .attr("y", h/2)
        .attr("text-anchor", "middle")
        .attr('stroke','red')
        .attr("font-size", 10)
        .attr("fill", "#fff")
        .text('No data in the period you selected');
      
      return
    }

    for (let i = 0; i < v_datas.length; i++) {
      averScores[i] = d3.mean(v_datas[i].map(d => d.score)).toFixed(1);
    }
    
    let sum = [];

    for (let i = 0; i < v_datas.length; i++) {
      sum.push(...v_datas[i].map(d => d.score));
    }

    const minScore = Math.min(...sum),
      maxScore = Math.max(...sum);

    const x = d3
      .scaleTime()
      .domain([between.fromDate - 56 * 60 * 60 * 1000, between.toDate + 24 * 60 * 60 * 1000])
      .rangeRound([0, w]);    

    const xAxis = svg
      .append("g")
      .attr("transform", `translate(0, ${h})`)
      .call(
        d3
          .axisBottom(x)
          .tickSize(-h)
          .ticks(14)
      );

    xAxis.select(".domain").attr("stroke", "#e9ebf1");
    xAxis
      .selectAll(".tick")
      .select("text")
      .attr("transform",() => days !== 7 ? "rotate(-65)" : "rotate(0)")
      .attr('text-anchor', days !== 7 ? 'end' : "middle")      
      .attr("clr", "#9aa1a9")      
      .text(d => formatTime(d));
    xAxis
      .selectAll(".tick")
      .select("line")
      .attr("stroke", "#e9ebf1");

    const y = d3
      .scaleLinear()
      .domain([0, maxScore + 5])
      .range([h, 0]);

    const yAxis = svg.append("g").call(
      d3
        .axisLeft(y)
        .ticks(5)
        .tickSize(-w)
    );

    yAxis.select(".domain").attr("stroke", "#e9ebf1");
    yAxis
      .selectAll(".tick")
      .select("text")
      .attr("clr", "#9aa1a9");
    yAxis
      .selectAll(".tick")
      .select("line")
      .attr("stroke", "#e9ebf1");
    
    const tooltip = svg.append("g").attr('visibility', 'hidden');
    tooltip
      .append("rect")
      .attr("rx", 3)
      .attr("ry", 3)
      .attr("width", 40)
      .attr("height", 15);
    tooltip
      .append("text")
      .attr('x', 20)
      .attr('y', 10)
      .attr("text-anchor", "middle")
      .attr("font-size", 10)
      .attr("fill", "#fff");


    for (let i = 0; i < v_datas.length; i++) {
      //append average score tag and dot line
      svg
        .append("rect")
        .attr("x", -40)
        .attr("y", y(averScores[i]) - 7.5)
        .attr("rx", 3)
        .attr("ry", 3)
        .attr("width", 30)
        .attr("height", 25)
        .attr("fill", v_datas[i][0].clr);

      svg
        .append("text")
        .attr("x", -25)
        .attr("y", y(averScores[i]) + 8)
        .attr("text-anchor", "middle")
        .attr("font-size", 12)
        .attr("fill", "#fff")
        .text("Avg.");

      svg
        .append("line")                
        .attr("stroke", v_datas[i][0].clr)
        .attr("stroke-width", 1)
        .style("stroke-dasharray", "6, 3")//between.fromDate - 56 * 60 * 60 * 1000, between.toDate + 24 * 60 * 60 * 1000
        .attr("x1", x(between.fromDate - 56 * 60 * 60 * 1000))
        .attr("y1", y(averScores[i]))
        .attr("x2", x(between.toDate + 24 * 60 * 60 * 1000))
        .attr("y2", y(averScores[i]))
        .attr("cursor", "pointer")
        .on("mouseover", () => {          
          tooltip
            .attr('visibility', 'visible')
            .attr('transform', `translate(${d3.event.pageX - 105}, ${y(averScores[i])})`);
          tooltip
            .select('rect')
            .attr('fill', v_datas[i][0].clr)
          tooltip
            .select('text')
            .text(averScores[i]);
          
        })
        .on("mouseout", (d, i) => {
          tooltip
            .attr('visibility', 'hidden')
        });      

      //add the phase lines
      const yValue = [0,100]
      let l_datas = [] 
      
      if(phaseLines[i]){
        for (let p_i = 0; p_i < phaseLines[i].length; p_i++) {
          svg.append('path')
            .datum(yValue)
            .attr('class','phase-line')
            .attr("fill", "none")
            .attr('class','phase-line')
            .attr("stroke", v_datas[i][0].clr)
            .attr("stroke-width", 1)
            .style("stroke-dasharray", "6, 3")
            .attr("d", d3.line()
              .x(x(parseInt(phaseLines[i][p_i] / (24 * 60 * 60)) * 1000 * 24 * 60 * 60 - offset * 60 * 60 * 1000))
              .y(d => y(d)))
            .attr('cursor', 'pointer')
        }  
        //seperate the basic line into several lines by phase lines.      
        for (let p = 0; p < phaseLines[i].length + 1; p++) {
          if(p === 0) { l_datas[p] = v_datas[i].filter(d => d.date < phaseLines[i][p] * 1000); continue }
          if(p === phaseLines[i].length) { l_datas[p] = v_datas[i].filter(d => d.date > phaseLines[i][p - 1] * 1000); continue }
          else l_datas[p] = v_datas[i].filter(d => d.date > phaseLines[i][p - 1] * 1000 && d.date < phaseLines[i][p] * 1000)
        }
        for (let l = 0; l < l_datas.length; l++) {

          //append score viewData  
          if(l_datas[l].length)    
            svg.append("path")
            .datum(l_datas[l])  
            .attr("fill", "none")
            .attr("stroke", v_datas[i][0].clr)
            .attr("stroke-width", 2)
            .attr("d", d3.line().defined(function (d) { return d.score !== null; })
              .x(d => x(parseInt(d.date / (1000 * 24 * 60 * 60)) * 1000 * 24 * 60 * 60 - offset * 60 * 60 * 1000))
              .y(d => y(d.score)));        
          else continue  
        }        
      }
      else{ 
        //append score viewData
        svg
        .append("path")
        .datum(v_datas[i])
        .attr("fill", "none")
        .attr("stroke", d => d[0].clr)
        .attr("stroke-width", 2)
        .attr(
          "d",
          d3
            .line()
            .defined(function(d) {
              return d.score !== null;
            })
            .x(d => x(parseInt(d.date / (1000 * 24 * 60 * 60)) * 1000 * 24 * 60 * 60 - offset * 60 * 60 * 1000))
            .y(d => y(d.score))
        );       
      }     

      svg
        .selectAll(".circles")
        .data(v_datas[i].filter(d => d.score))
        .enter()
        .append("circle")
        .attr("cx", d => x(parseInt(d.date / (1000 * 24 * 60 * 60)) * 1000 * 24 * 60 * 60 - offset * 60 * 60 * 1000))
        .attr("cy", d => y(d.score))
        .attr("r", 5)
        .attr("fill", d => d.clr)
        .attr("cursor", "pointer")
        // .attr('aria-describedby', arrowRef)
        .on('click', (d, index, nodes) => {  
          console.log(new Date(d))
          handleClick(nodes[index], behaviorName[i], d)
        })
        .on("mouseover", (d, i) => {
          // svg
          //   .append("rect")
          //   .attr("class", "tooltipRect")
          //   .attr("x", x(d.date))
          //   .attr("y", y(d.score) - 20)
          //   .attr("rx", 3)
          //   .attr("ry", 3)
          //   .attr("width", 50)
          //   .attr("height", 15)
          //   .attr("fill", clrList[i]);
          // svg
          //   .append("text")
          //   .attr("class", "tooltipText")
          //   .attr(
          //     "x",
          //     x(
          //       Math.round(d.date / (24 * 60 * 60)) * 24 * 60 * 60 -
          //         offset * 60 * 60
          //     ) + 25
          //   )
          //   .attr("y", y(d.score) - 10)
          //   .attr("text-anchor", "middle")
          //   .attr("font-size", 10)
          //   .attr("fill", "#fff")
          //   .text("(" + formatTime(d.date) + ":" + d.score + ")");
        })
        .on("mouseout", d => {
          // svg.selectAll(".tooltipText").remove();
          // svg.selectAll(".tooltipRect").remove();
        });
    }
  }, [data, width, height, behaviors, between]);

  const handleClick = (event, name, info) => {
    console.log(event)
    setAnchorEl(anchorEl? null : event);
    setBName(name)
    setInfo(info)
    // console.log(open)
  };

  const open = Boolean(anchorEl);
  const id = open ? 'transitions-popper' : undefined;

  const handleDelete = () => {
    console.log('hhhhhh')
  }
  

  return(
    <>
      <Popper
        id={'transitions-popper'}
        open={open} anchorEl={anchorEl} transition
        placement="right"
        disablePortal={true}
        modifiers={{
          flip: {
            enabled: true,
          },
          preventOverflow: {
            enabled: false,
            boundariesElement: 'scrollParent',
          },
          arrow: {
            enabled: true,
            // element: arrowRef,
          },
        }}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={350}>
            <Paper>
              <Grid container spacing={1} className={classes.typography}>
                <Grid item xs={12}>
                  {b_name}
                </Grid>
                <Grid container spacing={1} className={classes.info}>
                  <Grid item xs={12}>
                      <span style={{ color: info.clr }}>
                        &#11044;
                      </span>&nbsp;{info.score}
                  </Grid>
                  <Grid item xs={12}>
                    <img src="svg/user icon.svg"/>{studentName}
                  </Grid>
                  <Grid item xs={12}>
                    <img src="svg/Calendar grey.svg"/>{moment(info.date).format('D-MMMM-YYYY')}
                  </Grid>
                  <Grid item xs={12}>
                    <img src="svg/icon clock grey.svg"/>{moment(info.date).format('LT')}
                  </Grid>
                  <Grid item xs={12}>
                    <img src="svg/icon location grey.svg"/>Classroom
                  </Grid>
                </Grid>                
                
                <Grid container item xs={6} justify="center" alignItems="center" direction="row">
                  <Button variant="contained" color="primary" style={{backgroundColor: '#468cc2', width: '90%'}}>
                    Edit
                  </Button>
                </Grid>
                <Grid container item xs={6} justify="center" alignItems="center" direction="row">
                  <Button
                    startIcon={<DeleteIcon />} style={{width:'90%'}} onClick={handleDelete}
                  >
                    Delete
                  </Button>
                </Grid>

              </Grid>
            </Paper>
          </Fade>
        )}
      </Popper>
    <svg ref={svgRef} width={width} height={height} />
  </>
  ) 
};

export default LineChart;
