const fs = require('fs').promises;
const axios = require('axios');

const api = axios.create({
  baseURL: 'https://api.glitch.com',
  timeout: 5000,
});

async function getHomeData() {
  const rawData = JSON.parse(await fs.readFile('.data/pupdate.json'));
  const relevantData = pick(rawData, ['pupdates']);
  return { ...relevantData};
}

function pick (obj, keys) {
  const out = {};
  for (const key of keys) {
    out[key] = obj[key];
  }
  return out;
}

// like Promise.all but with an object instead of an array, e.g.
// `let { user, projects } = await allByKeys({ user: getUser(id), projects: getProjects(id) })`
const allByKeys = async (objOfPromises) => {
  const keys = Object.keys(objOfPromises);
  const values = await Promise.all(Object.values(objOfPromises));
  return keys.reduce((result, key, i) => {
    result[key] = values[i];
    return result;
  }, {});
};

const getAllPages = async (url) => {
  let hasMore = true;
  let results = [];
  while (hasMore) {
    const { data } = await api.get(url);
    results.push(...data.items);
    if (data.hasMore && !data.lastOrderValue) {
      return results;
    }
    hasMore = data.hasMore;
    url = data.nextPage;
  }
  return results;
};

module.exports = { getHomeData, getAllPages };

