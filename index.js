import youtubesearchapi from "youtube-search-api";
import Fastify from 'fastify';
import fs from 'fs';
import cors from '@fastify/cors'

const fastify = Fastify();
await fastify.register(cors)

let newestVideosFetch = [];
let topVideosFetch = [];
let channels = JSON.parse(fs.readFileSync('./channels.json', 'utf-8'));
let cIndex = 0;
let total = 0;
let previousCounts = {};

let data = {
    count: 0,
    top: [],
    latest: [],
    teams: []
}

function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

async function getVideos() {
    try {
        newestVideosFetch = await youtubesearchapi.GetListByKeyword(`"TeamWater"&sp=CAI%253D`);
        topVideosFetch = await youtubesearchapi.GetListByKeyword(`"TeamWater"&sp=CAMSAhAB`);

        topVideosFetch.items = await Promise.all(topVideosFetch.items.map(async item => {
            const res = await fetch(`https://mixerno.space/api/youtube-video-counter/user/${item.id}`);
            const data = await res.json();

            item.views = data.counts[0].count;
            return item;
        }));

        topVideosFetch.items = topVideosFetch.items.sort((a, b) => a.views - b.views);
    } catch { }
}

function getChannel() {
    const channelId = Object.keys(channels)[cIndex];

    if (!channelId || channelId === "undefined") {
        cIndex = 0;
        return;
    }

    fetch('https://backend.mixerno.space/api/youtube/estv3/' + channelId)
        .then(res => res.json())
        .then(response => {
            const videoData = response.items?.[0];
            if (!videoData) return;

            const newCount = parseInt(videoData.statistics?.subscriberCount || 0);

            // Store updated channel data
            channels[channelId] = videoData;

            // Update total using delta logic
            const oldCount = previousCounts[channelId] || 0;
            total += newCount - oldCount;
            previousCounts[channelId] = newCount;

            fs.writeFileSync('./channels.json', JSON.stringify(channels, null, 4), 'utf-8');
        })
        .finally(() => {
            cIndex++;
        });
}

getChannel()
setInterval(getChannel, 1000);

function gtt() {
    fetch("https://api.tiltify.com/", {
        "headers": {
            "accept": "*/*",
            "cache-control": "no-cache",
            "content-type": "application/json",
            "pragma": "no-cache",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "cross-site",
            "sec-fetch-storage-access": "none",
            "sec-gpc": "1"
        },
        "body": "{\"operationName\":\"FactById\",\"variables\":{\"id\":\"0478358a-c4ff-4ab0-9cc7-5f0b328df9dc\"},\"query\":\"query FactById($id: ID!) {\\n  fact(id: $id) {\\n    id\\n    name\\n    link\\n    totalAmountRaised {\\n      value\\n      currency\\n      __typename\\n    }\\n    usageType\\n    currency\\n    status\\n    supportedFacts {\\n      id\\n      name\\n      usageType\\n      __typename\\n    }\\n    schedules {\\n      id\\n      name\\n      description\\n      __typename\\n    }\\n    banner {\\n      src\\n      alt\\n      width\\n      height\\n      __typename\\n    }\\n    video\\n    rewards {\\n      id\\n      name\\n      description\\n      amount {\\n        value\\n        currency\\n        __typename\\n      }\\n      image {\\n        src\\n        alt\\n        width\\n        height\\n        __typename\\n      }\\n      quantity\\n      remaining\\n      __typename\\n    }\\n    sponsors {\\n      id\\n      name\\n      image {\\n        src\\n        alt\\n        width\\n        height\\n        __typename\\n      }\\n      link\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\"}",
        "method": "POST",
        "mode": "cors",
        "credentials": "omit"
    }).then(res => res.json()).then(res => {
        data.count = res.data.fact.totalAmountRaised.value
        fs.appendFileSync("./data.txt", `${data.count} ${new Date().getTime()}\n`)
    })

    fetch("https://api.tiltify.com/", {
        "headers": {
            "accept": "*/*",
            "cache-control": "no-cache",
            "content-type": "application/json",
            "pragma": "no-cache",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "cross-site",
            "sec-fetch-storage-access": "none",
            "sec-gpc": "1"
        },
        "body": "{\"operationName\":\"get_fact_donor_leaderboard\",\"variables\":{\"id\":\"0478358a-c4ff-4ab0-9cc7-5f0b328df9dc\",\"limit\":10},\"query\":\"query get_fact_donor_leaderboard($id: ID!, $limit: Int) {\\n  fact(id: $id) {\\n    id\\n    donorLeaderboard(range: \\\"default\\\") {\\n      id\\n      ...DefaultTemplateFactLeaderboardsAmount\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\\nfragment DefaultTemplateFactLeaderboardsAmount on Leaderboard {\\n  id\\n  entries(first: $limit) {\\n    edges {\\n      node {\\n        id\\n        name\\n        latestComment\\n        heat\\n        url\\n        amount {\\n          value\\n          currency\\n          __typename\\n        }\\n        avatar {\\n          src\\n          alt\\n          width\\n          height\\n          __typename\\n        }\\n        __typename\\n      }\\n      __typename\\n    }\\n    __typename\\n  }\\n  __typename\\n}\\n\"}",
        "method": "POST",
        "mode": "cors",
        "credentials": "omit"
    }).then(res => res.json())
        .then(res => {
            data['top'] = res.data.fact.donorLeaderboard.entries.edges.map(item => {
                return {
                    name: item.node.name,
                    amount: item.node.amount.value
                }
            })
        })

    fetch("https://api.tiltify.com/", {
        "headers": {
            "accept": "*/*",
            "cache-control": "no-cache",
            "content-type": "application/json",
            "pragma": "no-cache",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "cross-site",
            "sec-fetch-storage-access": "none",
            "sec-gpc": "1"
        },
        "body": "{\"operationName\":\"get_latest_fact_donations_\",\"variables\":{\"id\":\"0478358a-c4ff-4ab0-9cc7-5f0b328df9dc\",\"limit\":10},\"query\":\"query get_latest_fact_donations_($id: ID!, $limit: Int) {\\n  fact(id: $id) {\\n    id\\n    donations(first: $limit) {\\n      pageInfo {\\n        startCursor\\n        endCursor\\n        hasNextPage\\n        hasPreviousPage\\n        __typename\\n      }\\n      edges {\\n        cursor\\n        node {\\n          id\\n          donorName\\n          donorComment\\n          completedAt\\n          amount {\\n            value\\n            currency\\n            __typename\\n          }\\n          fact {\\n            id\\n            link\\n            ownership {\\n              id\\n              name\\n              __typename\\n            }\\n            __typename\\n          }\\n          __typename\\n        }\\n        __typename\\n      }\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\"}",
        "method": "POST",
        "mode": "cors",
        "credentials": "omit"
    }).then(res => res.json())
        .then(res => {
            data['latest'] = res.data.fact.donations.edges.map(item => {
                return {
                    name: item.node.donorName,
                    amount: item.node.amount.value
                }
            })
        })

    fetch("https://api.tiltify.com/", {
        "headers": {
            "accept": "*/*",
            "cache-control": "no-cache",
            "content-type": "application/json",
            "pragma": "no-cache",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "cross-site",
            "sec-fetch-storage-access": "none",
            "sec-gpc": "1"
        },
        "body": "{\"operationName\":\"get_fact_fundraiser_team_leaderboard\",\"variables\":{\"id\":\"0478358a-c4ff-4ab0-9cc7-5f0b328df9dc\",\"limit\":10},\"query\":\"query get_fact_fundraiser_team_leaderboard($id: ID!, $limit: Int) {\\n  fact(id: $id) {\\n    id\\n    fundraiserTeamLeaderboard(range: \\\"default\\\") {\\n      id\\n      ...DefaultTemplateFactLeaderboardsAmount\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\\nfragment DefaultTemplateFactLeaderboardsAmount on Leaderboard {\\n  id\\n  entries(first: $limit) {\\n    edges {\\n      node {\\n        id\\n        name\\n        latestComment\\n        heat\\n        url\\n        amount {\\n          value\\n          currency\\n          __typename\\n        }\\n        avatar {\\n          src\\n          alt\\n          width\\n          height\\n          __typename\\n        }\\n        __typename\\n      }\\n      __typename\\n    }\\n    __typename\\n  }\\n  __typename\\n}\\n\"}",
        "method": "POST",
        "mode": "cors",
        "credentials": "omit"
    }).then(res => res.json())
        .then(res => {
            data['teams'] = res.data.fact.fundraiserTeamLeaderboard.entries.edges.map(item => {
                return {
                    name: item.node.name,
                    amount: item.node.amount.value,
                    image: item.node.avatar.src
                }
            })
        })


} setInterval(gtt, 5000);
gtt()


fastify.get('/videos', async function handler(request, reply) {
    return {
        top: topVideosFetch,
        latest: newestVideosFetch
    };
})

fastify.get('/data', async function handler(request, reply) {
    return data;
})

fastify.get('/channels', async function handler(request, reply) {
    return channels;
})

fastify.get('/teams', async function handler(request, reply) {
    return data['teams'];
})

fastify.get('/count', async function handler(request, reply) {
    return { count: data.count };
})

getVideos();
setInterval(getVideos, 30000);

setTimeout(function () {
    fastify.listen({ port: 8080 }, function (err, address) {
        if (err) {
            fastify.log.error(err)
            process.exit(1)
        }
        // Server is now listening on ${address}
    })
}, 5000)