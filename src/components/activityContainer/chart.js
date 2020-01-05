import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import moment from 'moment';
import EditModal from './editModal';

const formatTime = d3.timeFormat('%b-%d');
const perMilliSeconds = 1000;
const hourMilliSeconds = 1000 * 60 * 60;
const dayMilliSeconds = 24 * 1000 * 60 * 60;
const secPerday = 24 * 60 * 60;
const limitDay = 7;

const LineChart = ({ data, width, height, topMargin, between, activityName, colorList, days, observerName, re_render, flag, colorMap}) => {
  const svgRef = useRef();
  const [tooltipState, setTooltipState] = useState({ show: false, dir: 'left' });
  useEffect(() => {
    d3.select(svgRef.current)
      .selectAll('*')
      .remove();

    const margin = { top: 30, right: 20, bottom: 50, left: 80 },
      w = width - margin.left - margin.right,
      h = height - margin.top - margin.bottom;

    const svg = d3
      .select(svgRef.current)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    if (data.length === 0) {
      svg
        .append('text')
        .attr('x', w / 2)
        .attr('y', h / 2)
        .attr('text-anchor', 'middle')
        .attr('stroke', 'grey')
        .attr('font-size', 14)
        .attr('fill', '#fff')
        .text('No data in the period you selected');

      return;
    }

    let v_datas = [],
      filtered = [],
      phaseLines = [],
      color = [],
      activity_color = '';

    //add transparent rectangle for disappear tooltip
    svg
      .append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'transparent')
      .on('click', () => {
        setTooltipState({ ...tooltipState, show: false });
      });

    const offset = (-new Date().getTimezoneOffset() / 60) * hourMilliSeconds;
    if (between) {
      for (let i = 0; i < data.length; i++) {
        filtered = data[i]
          .filter(d => d.date >= between.fromDate && d.date <= between.toDate)
          .sort((a, b) => (a.date < b.date ? -1 : 0));
        
        if(flag && filtered && filtered.length)
          color.push(colorMap.filter(e => e.id === filtered[0].target_id)[0].color);
      
        if (filtered && filtered.length) {
          let baseDate = moment(filtered[0].date - offset).format('MMM Do YY');
          let baseTime = filtered[0].date;
          let sum_d = 0;
          let count = 0;
          let s_day = [];
          let targets_perDay = []
          activity_color = filtered[0].clr;
          
          for (let k = 0; k < filtered.length; k++) {
            if (moment(filtered[k].date - offset).format('MMM Do YY') === baseDate) {
              sum_d += filtered[k].totalTrialsPercentCorrect;
              targets_perDay.push(filtered[k].targetEntryId)
              count++;
              if (k === filtered.length - 1) s_day.push({ date: baseTime, score: sum_d / count, targetName: filtered[k].target_name , targetsPerDay: targets_perDay});
            } else {
              s_day.push({ date: baseTime, score: sum_d / count, targetName: filtered[k].target_name, targetsPerDay: targets_perDay});
              baseDate = moment(filtered[k].date - offset).format('MMM Do YY');
              baseTime = filtered[k].date;
              sum_d = filtered[k].totalTrialsPercentCorrect;
              targets_perDay = []
              targets_perDay.push(filtered[k].targetEntryId)
              count = 1;
              if (k === filtered.length - 1) s_day.push({ date: baseTime, score: sum_d / count, targetName: filtered[k].target_name, targetsPerDay: targets_perDay});
            }
          }

          v_datas.push(s_day);
        }
      }
    } else return;

    let averScores = [];
    //get the offset between current time zone and default time zone

    if (!v_datas.length) {
      svg
        .append('text')
        .attr('x', w / 2)
        .attr('y', h / 2)
        .attr('text-anchor', 'middle')
        .attr('stroke', 'grey')
        .attr('font-size', 12)
        .attr('fill', '#fff')
        .text('No data in the period you selected');

      return;
    }

    for (let i = 0; i < v_datas.length; i++) {
      averScores[i] = d3.mean(v_datas[i].map(d => d.score)).toFixed(1);
    }

    let sum = [];

    for (let i = 0; i < v_datas.length; i++) {
      sum.push(...v_datas[i].map(d => d.score));
    }

    const x = d3
      .scaleTime()
      .domain([between.fromDate - dayMilliSeconds, between.toDate + hourMilliSeconds])
      .rangeRound([0, w]);
    const xAxis = svg
      .append('g')
      .attr('transform', `translate(0, ${h})`)
      .call(
        d3
          .axisBottom(x)
          .tickSize(-h)
          .ticks(days === limitDay || days === limitDay * 2 ? d3.timeDay.every(1) : 14),
      );

    xAxis.select('.domain').attr('stroke', '#e9ebf1');
    xAxis
      .selectAll('.tick')
      .select('text')
      .style('font-size', 14)
      .attr('transform', () => (days !== limitDay ? 'rotate(-65)' : 'rotate(0)'))
      .attr('text-anchor', days !== limitDay ? 'end' : 'middle')
      .attr('clr', '#9aa1a9')
      .attr('dy', 15)
      .text(d => formatTime(d));
    xAxis
      .selectAll('.tick')
      .select('line')
      .attr('stroke', '#e9ebf1');

    const y = d3
      .scaleLinear()
      .domain([0, 100])
      .range([h, 0]);

    const yAxis = svg.append('g').call(
      d3
        .axisLeft(y)
        .ticks(5)
        .tickSize(-w),
    );

    yAxis.select('.domain').attr('stroke', '#e9ebf1');
    yAxis
      .selectAll('.tick')
      .select('text')
      .style('font-size', 14)
      .attr('clr', '#9aa1a9')
      .text(d => d + '%');
    yAxis
      .selectAll('.tick')
      .select('line')
      .attr('stroke', '#e9ebf1');
    svg
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -h / 2)
      .attr('y', -60)
      .attr('text-anchor', 'middle')
      .style('font-size', 14)
      .text('Percent correct');

    const tooltip = svg.append('g').attr('visibility', 'hidden');
    tooltip
      .append('rect')
      .attr('rx', 3)
      .attr('ry', 3)
      .attr('width', 40)
      .attr('height', 15);
    tooltip
      .append('text')
      .attr('x', 20)
      .attr('y', 10)
      .attr('text-anchor', 'middle')
      .attr('font-size', 10)
      .attr('fill', '#fff');

    for (let i = 0; i < v_datas.length; i++) {
      //append average score tag and dot line
      svg
        .append('rect')
        .attr('x', -55)
        .attr('y', y(averScores[i]) - 7.5)
        .attr('rx', 3)
        .attr('ry', 3)
        .attr('width', 30)
        .attr('height', 25)
        .attr('fill', activity_color ? activity_color : color[i]);

      svg
        .append('text')
        .attr('x', -40)
        .attr('y', y(averScores[i]) + 8)
        .attr('text-anchor', 'middle')
        .attr('font-size', 12)
        .attr('fill', '#fff')
        .text('Avg.');

      svg
        .append('line')
        .attr('stroke', activity_color ? activity_color : color[i])
        .attr('stroke-width', 1)
        .style('stroke-dasharray', '6, 3')
        .attr('x1', x(between.fromDate - dayMilliSeconds))
        .attr('y1', y(averScores[i]))
        .attr('x2', x(between.toDate + hourMilliSeconds))
        .attr('y2', y(averScores[i]))
        .attr('cursor', 'pointer')
        .on('mouseover', () => {
          tooltip
            .attr('visibility', 'visible')
            .attr('transform', `translate(${d3.event.pageX - 105}, ${y(averScores[i])})`);
          tooltip.select('rect').attr('fill', v_datas[i][0].clr);
          tooltip.select('text').text(averScores[i]);
        })
        .on('mouseout', (d, i) => {
          tooltip.attr('visibility', 'hidden');
        });

      //add the phase lines
      const yValue = [0, 100];
      let l_datas = [];

      if (phaseLines[i]) {
        for (let p_i = 0; p_i < phaseLines[i].length; p_i++) {
          svg
            .append('path')
            .datum(yValue)
            .attr('class', 'phase-line')
            .attr('fill', 'none')
            .attr('class', 'phase-line')
            .attr('stroke', v_datas[i][0].clr)
            .attr('stroke-width', 1)
            .style('stroke-dasharray', '6, 3')
            .attr(
              'd',
              d3
                .line()
                .x(x(parseInt(phaseLines[i][p_i] / secPerday) * dayMilliSeconds - offset))
                .y(d => y(d)),
            )
            .attr('cursor', 'pointer');
        }
        // //seperate the basic line into several lines by phase lines.
        for (let p = 0; p < phaseLines[i].length + 1; p++) {
          if (p === 0) {
            l_datas[p] = v_datas[i].filter(d => d.date < phaseLines[i][p] * perMilliSeconds);
            continue;
          }
          if (p === phaseLines[i].length) {
            l_datas[p] = v_datas[i].filter(d => d.date > phaseLines[i][p - 1] * perMilliSeconds);
            continue;
          } else
            l_datas[p] = v_datas[i].filter(
              d =>
                d.date > phaseLines[i][p - 1] * perMilliSeconds &&
                d.date < phaseLines[i][p] * perMilliSeconds,
            );
        }
        for (let l = 0; l < l_datas.length; l++) {
          //append score viewData
          if (l_datas[l].length)
            svg
              .append('path')
              .datum(l_datas[l])
              .attr('fill', 'none')
              .attr('stroke', v_datas[i][0].clr)
              .attr('stroke-width', 2)
              .attr(
                'd',
                d3
                  .line()
                  .defined(function(d) {
                    return d.score !== null;
                  })
                  .x(d => x(parseInt(d.date / dayMilliSeconds) * dayMilliSeconds - offset))
                  .y(d => y(d.score)),
              );
          else continue;
        }
      } else {
        //append score viewData
        svg
          .append('path')
          .datum(v_datas[i])
          .attr('fill', 'none')
          .attr('stroke', activity_color ? activity_color : color[i])
          .attr('stroke-width', 2)
          .attr(
            'd',
            d3
              .line()
              .defined(function(d) {
                return d.score !== null;
              })
              .x(d => x(parseInt(d.date / dayMilliSeconds) * dayMilliSeconds - offset))
              .y(d => y(d.score)),
          );
      }

      svg
        .selectAll('.circles')
        .data(v_datas[i].filter(d => d.score))
        .enter()
        .append('circle')
        .attr('cx', d => x(parseInt(d.date / dayMilliSeconds) * dayMilliSeconds - offset))
        .attr('cy', d => y(d.score))
        .attr('r', 5)
        .attr('fill', activity_color ? activity_color : color[i])
        .attr('cursor', 'pointer')
        .on('click', d => {
          const cx = x(parseInt(d.date / dayMilliSeconds) * dayMilliSeconds - offset),
            dir = cx > width / 2 ? 'right' : 'left',
            spacing = cx > width / 2 ? 12 : 43;
          setTooltipState({
            x: cx + margin.left + spacing,
            y: y(d.score) + topMargin + 48,
            show: true,
            color: color[i],
            dir: dir,
            observerName: observerName,
            targetName: d.targetName,
            targetId: d.targetId,
            targetsPerDay: d.targetsPerDay,
            re_render: re_render,
            data: { ...d },
          });
        });
    }
  }, [data, width, height, between, colorList, days, tooltipState, topMargin]);

  return (
    <>
      {tooltipState.show && <EditModal info={tooltipState} />}
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
      <svg ref={svgRef} width={width} height={height} />
    </>
  );
};

export default LineChart;
