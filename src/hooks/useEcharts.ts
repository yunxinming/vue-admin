import * as echarts from 'echarts/core'
import { LineChart } from 'echarts/charts'
import type { LineSeriesOption } from 'echarts/charts'
import { TitleComponent, TooltipComponent, GridComponent, DatasetComponent, TransformComponent } from 'echarts/components'
import type { TitleComponentOption, TooltipComponentOption, GridComponentOption, DatasetComponentOption } from 'echarts/components'
import { LabelLayout, UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'

// 通过 ComposeOption 来组合出一个只有必须组件和图表的 Option 类型
type ECOption = echarts.ComposeOption<LineSeriesOption | TitleComponentOption | TooltipComponentOption | GridComponentOption | DatasetComponentOption>

// 注册必须的组件
echarts.use([TitleComponent, TooltipComponent, GridComponent, DatasetComponent, TransformComponent, LineChart, LabelLayout, UniversalTransition, CanvasRenderer])
export default echarts
export const option: ECOption = {
  title: {
    text: 'LineChart'
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
      label: {
        backgroundColor: '#6a7985',
      },
    },
  },
  grid: {
    left: '0%',
    right: '4%',
    bottom: '3%',
    containLabel: true,
  },
  xAxis: [{ type: 'category', boundaryGap: false, data: ['星期一', '星期二', '星期三'] }],
  yAxis: [{ type: 'value' }],
  series: [
    {
      name: '数据一',
      type: 'line',
      stack: 'Total',
      emphasis: {
        focus: 'series',
      },
      areaStyle: {},
      data: [801, 2810, 3023],
    },
    {
      name: '数据二',
      type: 'line',
      stack: 'Total',
      emphasis: {
        focus: 'series',
      },
      areaStyle: { color: '#ff0', opacity: 0.5 },
      data: [1125, 2112, 2903],
    },
  ],
}
