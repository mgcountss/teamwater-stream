const colors = ['#FFC107', '#9E9E9E', '#F57C00', '#64B5F6', '#64B5F6', '#64B5F6', '#64B5F6', '#64B5F6', '#64B5F6', '#64B5F6'];
const counter = document.getElementById('main');
const goal = document.getElementById('goal');
const latestDiv = document.getElementById('recentDonations');
const topDiv = document.getElementById('topDonations');
const progressFill = document.querySelector('.progress-fill');

const od = new Odometer({
    el: document.getElementById('main'),
    value: 0
});

const chart = Highcharts.chart('container', {
    chart: {
        type: 'areaspline',
        zoomType: 'x',
        backgroundColor: 'transparent',
        plotBorderColor: 'transparent'
    },
    title: { text: ' ' },
    credits: { enabled: false },
    xAxis: { type: 'datetime', visible: false },
    yAxis: { visible: false },
    plotOptions: {
        series: { threshold: null, fillOpacity: 0.25 },
        area: { fillOpacity: 0.25 }
    },
    series: [{
        showInLegend: false,
        name: 'Subscribers',
        marker: { enabled: false },
        color: '#0000FF',
        lineColor: 'blue',
        lineWidth: 2
    }]
});

function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}

function updateCounters() {
    const time = (new Date()).getTime();
    fetch('http://localhost:8080/data')
        .then(res => res.json())
        .then(data => {
            const count = parseFloat(data.count);

            counter.textContent = Math.floor(count);
            goal.textContent = Math.floor(count);

            const percentage = (count / 40000000) * 100;
            progressFill.style.width = `${Math.min(percentage, 100)}%`;

            const series = chart.series[0];
            series.addPoint([time, count], true, series.data.length > 3000);
            console.log(chart.series)


            data.latest.forEach((user, index) => {
                if (index < 10) {
                    latestDiv.children[index].querySelector('.donor-name').innerText = user.name;
                    latestDiv.children[index].querySelector('.donation-amount').innerText =  '$' + parseFloat(user.amount).toLocaleString('en-US');
                }
            });

            data.top.forEach((user, index) => {
                if (index < 9) {
                    topDiv.children[index].querySelector('.parent-rank').innerHTML = `<span class="rank" style="color: ${colors[index]};">${index + 1}</span> ${user.name}`;
                    topDiv.children[index].children[1].innerText = '$' + parseFloat(user.amount).toLocaleString('en-US');
                }
            });
        })
}

setInterval(updateCounters, 2000);
updateCounters();