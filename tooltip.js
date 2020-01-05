 
import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { IChartData } from '..';

interface IProps {
    data: IChartData;
    isCountChart?: boolean;
    idx?: number;
    showLimit: number;
    width: number;
    height: number;
}
const BarChart: React.SFC<IProps> = (props) => {
    const { data, isCountChart, idx, showLimit, width, height } = props,
        idx_str = idx != null ? idx : '';
    const SMALL_SIZEY = 200;
    const svgRef = useRef(null);
    const getConvertedData = (w_data: any) => {
        let c_data = [];
        if (isCountChart) {
            c_data = d3.nest()
                .key((d: any) => d.value)
                .rollup((v: any) => v.length)
                .entries(w_data);
            c_data.map((d: any) => {
                d.label = d.key;
                return d;
            });
        } else {
            c_data = w_data;
        }
        return c_data;
    }

    const c_data = getConvertedData(data.values);
    const cache = useRef(c_data);

    useEffect(() => drawChart(), [width, height, data]);
    const drawChart = () => {        
        if (data == null) return;
        let curData = c_data;
        let prevData = cache.current;
        if (curData.length != prevData.length || isCountChart) {
            prevData = revisionPrevData();
        }

        let margins = getMargins(c_data),
            rw = width - margins.right - margins.left,
            rh = height - margins.top - margins.bottom;

        let min: number = 0,// d3.min
            max: any = d3.max(c_data, (d: any) => d.value);

        let x: any = d3
            .scaleBand()
            .range([0, rw])
            .domain(c_data.map((d: any, i: any) => d.label + i))
            .padding(0.3),
            y = d3
                .scaleLinear()
                .domain([min, max])
                .rangeRound([rh, 0]),
            xAxis = d3
                .axisBottom(x)
                .tickSize(0),
            yAxis = d3
                .axisLeft(y)
                .tickSize(-rw)
                .ticks(5);

        let graphArea = d3.select(svgRef.current)
            .append("g").attr('class', 'graphArea')
            .attr('transform', "translate(" + (margins.left) + "," + (margins.top) + ")")

        graphArea.select('.xArea').remove();
        let xArea = graphArea.append('g').attr('class', 'xArea')
            .attr('transform', "translate(0," + rh + ")");
        let step = Math.ceil(c_data.length /25);
        xArea
            .attr('class', 'x axis')
            .call(xAxis)
            .selectAll('text')
            .attr('class', (d, i) => 'bar-x-text' + d + i)
            .text((d: any, i) => d.substr(0, d.length - i.toString().length))
            .attr('opacity', (d: any, i) => i % step != 0 || height < SMALL_SIZEY ? 0 : 1)
            .style("font", "300 10px Arial")
            .attr('text-anchor', curData.length > (1.1*width / showLimit) ? 'start' : 'middle')
            .attr('transform', curData.length > (1.1*width / showLimit) ? 'rotate(45)' : 'rotate(0)');
        xArea
            .selectAll('path')
            .attr('opacity', 0)

        graphArea.select('.yArea').remove();
        let yArea = graphArea.append('g').attr('class', 'yArea')
        yArea
            .attr('class', 'y axis')
            .call(yAxis)
            .selectAll('text')
            .attr('opacity', (d: any) => height < SMALL_SIZEY ? 0 : 1)
            .style("font", "300 10px Arial")
            .select('.domain')
            .remove();

        yArea
            .selectAll('path')
            .attr('opacity', 0)
        graphArea
            .selectAll('.tick line')
            .attr('stroke', '#ccc');

        const tooltip = graphArea.append('g')
        
        const bar_group = graphArea.append('g')
            .selectAll('bar-group')
            .data(prevData)
            .enter().append("rect")
            .attr('class', (d: any, i: number) => 'bar' + idx_str + i)
            .style("fill", 'steelblue')
            .attr("x", (d: any, i) => x(d.label + i))
            .attr("y", (d: any) => y(d.value))
            .attr("width", x.bandwidth())
            .attr("height", (d: any) => Math.abs(rh - y(d.value)))
            .attr('cursor', 'pointer')
            .on("mouseover", (d: any, i) => {
                if(height > SMALL_SIZEY){
                    tooltip.attr('transform', 'translate(' + (x(d.label + i) + x.bandwidth()) + ',' + (y(d.value)) + ')').call(callout, d, i);
                    // graphArea.select('.bar-x-text' + d.label + i + i).attr('opacity', 1);
                    tooltip.raise();
                }
            })
            .on("mouseout", (d: any, i) => {
                // if(i % step != 0)
                //     graphArea.select('.bar-x-text' + d.label + i + i).attr('opacity', 0);
                tooltip.call(callout, null);
            })

        bar_group
            .data(curData)
            .transition().duration(1000)
            .attr("y", (d: any, i) => y(d.value))
            .attr("height", (d: any) => Math.abs(rh - y(d.value)))

        if (height > SMALL_SIZEY) {
            d3.select(svgRef.current)
                .append("text")
                .attr("x", margins.left)
                .attr("y", margins.top)
                .attr('dy', '-0.5em')
                .attr('font-size', '16pt')
                .attr('fill', 'black')
                .style("text-anchor", "start")
                .text(data.name)

            d3.select(svgRef.current).append("text")
                .attr("x", margins.left + width / 2)
                .attr("y", height)
                .attr("dy", "-0.2em")
                .attr('font-size', '12pt')
                .attr('fill', 'black')
                .style("text-anchor", "end")
                .text(data.XAxis)

            d3.select(svgRef.current).append("text")
                .attr("transform", "rotate(-90)")
                .attr("x", -height / 2)
                .attr("y", 15)
                .attr("dy", ".71em")
                .attr('font-size', '12pt')
                .attr('fill', 'black')
                .style("text-anchor", "middle")
                .text(data.YAxis)
        }

        const callout = (g: any, d: any, idx: any) => {
            if (!d) {
                g.selectAll("*").remove();
                return g.style('display', 'none');
            }

            g.style('display', null).style('pointer-events', 'none')

            const path = g.selectAll("path")
                .data([null])
                .join("path")
                .attr("fill", 'steelblue')
                .attr("stroke", "white");

            let strText = '(' + d.label + ':' + d.value + ')';

            const text = g.selectAll("text")
                .data([null])
                .join("text")
                .call((text: any) => text
                    .selectAll("tspan")
                    .data((strText + "").split(/\n/))
                    .join("tspan")
                    .attr('fill', 'white')
                    .attr('text-anchor', 'start')
                    .attr("x", 0)
                    .attr("y", (d: any, i: any) => `${i * 1.1}em`)
                    .text((d: any) => d));

            const { width: tw, height: th } = text.node().getBBox();
            let curX = margins.left + x(d.label + idx) + x.bandwidth();
            if ((curX + tw) > width - margins.right) {
                text.attr("transform", 'translate(' + (- x.bandwidth() - tw - 10) + ',0)')
                    .attr('dy', '0.3em')
                path
                    .attr("transform", 'translate(' + (-x.bandwidth()) + ',0)')
                    .attr("d", 'M0,0l-5,-5v' + (-(th - 10) / 2) + 'h' + (-tw - 10) + 'v' + th + 'h' + (tw + 10) + 'v' + (-(th - 10) / 2) + 'l5,-5z')
            } else {
                text.attr("transform", 'translate(' + 10 + ',0)').attr('dy', '0.3em')
                path.attr("d", 'M0,0l5,-5v' + (-(th - 10) / 2) + 'h' + (tw + 10) + 'v' + th + 'h' + (-(tw + 10)) + 'v' + (-(th - 10) / 2) + 'l-5,-5z')
            }
        }
        cache.current = curData;
    }
    const getMargins = (data: any) => {
        let x_max_len = d3.max(data, (d: any) => d.label.length);
        let x_max_el = data.filter((d: any) => d.label.length == x_max_len)[0];
        let y_max_len = d3.max(data, (d: any) => (d.value).toString().length);
        let y_max_el = data.filter((d: any) => (d.value).toString().length == y_max_len)[0];

        d3.select(svgRef.current)
            .append('text')
            .attr('class', 'measure_x')
            .style("font", "300 10px Arial")
            .text(x_max_el.label)
            .attr('opacity', 1);
        d3.select(svgRef.current)
            .append('text')
            .attr('class', 'measure_y')
            .style("font", "300 10px Arial")
            .text(y_max_el.value + "__")
            .attr('opacity', 1);

        let xbox = d3.select(svgRef.current).select('.measure_x').node().getBBox();
        let ybox = d3.select(svgRef.current).select('.measure_y').node().getBBox();
        d3.select(svgRef.current).selectAll("*").remove();
        return height > SMALL_SIZEY ? { top: 30, left: ybox.width + 30, bottom: data.length > 1.1 * width/showLimit ? xbox.width + 15 : xbox.height + 15, right: ybox.width }
                                    : { top: 10, left: 10, bottom: 10, right: 10 }
    }
    const revisionPrevData = () => {
        let rev_data = [];
        for (let i = 0; i < c_data.length; i++) {
            rev_data.push({
                label: c_data[i].label,
                value: 0,
                color: c_data[i].color
            })
        }
        return rev_data;
    }
    return (
        <svg className={"lineChart" + idx_str} ref={svgRef} width={width} height={height} />
    );
}
export default BarChart;
