function getLatestVideos() {
  fetch('http://localhost:8080/videos')
    .then(res => res.json())
    .then(data => {
      data.top.items = data.top.items.sort((a, b) => b.views - a.views);
      console.log(data.top.items[0], data.top.items[data.top.items.length - 1])
      for (let q = 0; q < 5; q++) {
        const parent = document.getElementById('topVideos').children[q];
        const video = data.top.items[q];

        parent.querySelector('.video-item-title').innerText = video.title;
        parent.querySelector('.video-item-channel').innerText = video.shortBylineText.runs[0].text;
        parent.querySelector('.video-thumbnail').src = `https://i.ytimg.com/vi/${video.id}/mqdefault.jpg`;
      }

      for (let q = 0; q < 5; q++) {
        const parent = document.getElementById('newVideos').children[q];
        const video = data.latest.items[q];

        parent.querySelector('.video-item-title').innerText = video.title;
        parent.querySelector('.video-item-channel').innerText = video.shortBylineText.runs[0].text;
        parent.querySelector('.video-thumbnail').src = `https://i.ytimg.com/vi/${video.id}/mqdefault.jpg`;
      }
    })
}
getLatestVideos();
setInterval(getLatestVideos, 30000);

function getChannels() {
  fetch('http://localhost:8080/channels')
    .then(res => res.json())
    .then(data => {
      // Convert data to array if it isn't already
      const channels = Object.values(data);

      // Sort by subscriber count descending
      channels.sort((a, b) => {
        return Number(b.statistics.subscriberCount) - Number(a.statistics.subscriberCount);
      });

      for (let q = 0; q < 5; q++) {
        const parent = document.querySelector('.top-creators').children[q];
        const channel = channels[q];

        parent.querySelector('.creator-name').innerText = channel.snippet.title;
        parent.querySelector('.creator-subs').innerText = channel.statistics.subscriberCount;

        if (parent.querySelector('.creator-image').src !== channel.snippet.thumbnails.default.url) {
          parent.querySelector('.creator-image').src = channel.snippet.thumbnails.default.url;
        }
      }
    });
    
  fetch('http://localhost:8080/teams')
    .then(res => res.json())
    .then(data => {
      for (let q = 0; q < 8; q++) {
        const parent = document.getElementById('donationGrid').children[q];
        const team = Object.values(data)[q];

        parent.querySelector('.donation-name').innerText = team.name;
        if (parent.querySelector('.donation-thumbnail').src != team.image) {
          parent.querySelector('.donation-thumbnail').src = team.image;
        }
        parent.querySelector('.donation-amount').innerText = '$' + parseFloat(team.amount).toLocaleString('en-US');
      }
    })
}
getChannels();
setInterval(getChannels, 3000);