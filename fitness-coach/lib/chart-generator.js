// lib/chart-generator.js
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const fs = require('fs');
const path = require('path');

class ChartGenerator {
  constructor() {
    this.width = 800;
    this.height = 600;
    this.canvas = new ChartJSNodeCanvas({
      width: this.width,
      height: this.height,
      backgroundColour: 'white'
    });
  }

  async generateWeightChart(data, exerciseName) {
    const config = {
      type: 'line',
      data: {
        labels: data.map(d => d.date),
        datasets: [{
          label: `${exerciseName} - 重量进步 (kg)`,
          data: data.map(d => d.maxWeight),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.3,
          fill: true,
          pointRadius: 5,
          pointHoverRadius: 7
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: `${exerciseName} 重量进步曲线`,
            font: { size: 20 }
          },
          legend: {
            display: true,
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            title: {
              display: true,
              text: '重量 (kg)'
            }
          },
          x: {
            title: {
              display: true,
              text: '日期'
            }
          }
        }
      }
    };

    return await this.canvas.renderToBuffer(config);
  }

  async generateVolumeChart(data, exerciseName) {
    const config = {
      type: 'bar',
      data: {
        labels: data.map(d => d.date),
        datasets: [{
          label: `${exerciseName} - 训练量 (kg)`,
          data: data.map(d => d.totalVolume),
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgb(54, 162, 235)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: `${exerciseName} 训练量趋势`,
            font: { size: 20 }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: '总训练量 (kg)'
            }
          }
        }
      }
    };

    return await this.canvas.renderToBuffer(config);
  }

  async generateBodyMetricsChart(data, metricType) {
    const labels = {
      weight: '体重 (kg)',
      body_fat: '体脂率 (%)',
      muscle_mass: '肌肉量 (kg)'
    };

    const config = {
      type: 'line',
      data: {
        labels: data.map(d => d.measured_at.split('T')[0]),
        datasets: [{
          label: labels[metricType] || metricType,
          data: data.map(d => d.value),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          tension: 0.3,
          fill: true
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: `${labels[metricType] || metricType} 变化趋势`,
            font: { size: 20 }
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            title: {
              display: true,
              text: labels[metricType] || metricType
            }
          }
        }
      }
    };

    return await this.canvas.renderToBuffer(config);
  }

  async saveChart(buffer, filename) {
    const chartsDir = path.join(__dirname, '../data/charts');
    if (!fs.existsSync(chartsDir)) {
      fs.mkdirSync(chartsDir, { recursive: true });
    }

    const filepath = path.join(chartsDir, filename);
    fs.writeFileSync(filepath, buffer);
    return filepath;
  }
}

module.exports = ChartGenerator;
