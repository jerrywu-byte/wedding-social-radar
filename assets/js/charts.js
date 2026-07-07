const RadarCharts = (() => {
  const instances = new Map();

  function destroy(id) {
    if (instances.has(id)) {
      instances.get(id).destroy();
      instances.delete(id);
    }
  }

  function renderChart(id, config) {
    destroy(id);
    const canvas = document.getElementById(id);
    if (!canvas || !window.Chart) {
      return;
    }
    instances.set(id, new Chart(canvas, config));
  }

  function palette() {
    return ["#0f766e", "#b45309", "#3f6212", "#be123c", "#1d4ed8", "#7c2d12", "#6d28d9", "#475569"];
  }

  function renderTrendCharts(stats) {
    renderChart("categoryChart", {
      type: "doughnut",
      data: {
        labels: stats.categoryLabels,
        datasets: [
          {
            data: stats.categoryValues,
            backgroundColor: palette()
          }
        ]
      },
      options: {
        plugins: {
          legend: {
            position: "bottom"
          }
        }
      }
    });

    renderChart("dailyChart", {
      type: "bar",
      data: {
        labels: stats.dailyLabels,
        datasets: [
          {
            label: "每日文章數",
            data: stats.dailyValues,
            backgroundColor: "#0f766e"
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0
            }
          }
        }
      }
    });

    renderChart("platformChart", {
      type: "pie",
      data: {
        labels: stats.platformLabels,
        datasets: [
          {
            data: stats.platformValues,
            backgroundColor: ["#0f766e", "#b45309", "#1d4ed8"]
          }
        ]
      },
      options: {
        plugins: {
          legend: {
            position: "bottom"
          }
        }
      }
    });
  }

  return {
    renderTrendCharts
  };
})();
