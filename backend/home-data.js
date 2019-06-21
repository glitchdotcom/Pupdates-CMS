const fs = require('fs').promises;
const axios = require('axios');

const api = axios.create({
  baseURL: 'https://api.glitch.com',
  timeout: 5000,
});

const userProps = [
  'id',
  'avatarUrl',
  'avatarThumbnailUrl',
  'login',
  'name',
  'location',
  'color',
  'description',
  'hasCoverImage',
  'coverColor',
  'thanksCount',
  'utcOffset',
];
const trimUserProps = (user) => pick(user, userProps);


async function getUniqueUsersInProjects(projects, maxCount) {
  const users = {};
  for await (const project of projects) {
    const projectUsers = await getAllPages(`v1/projects/by/id/users?id=${project.id}&limit=100`);
    for (const user of projectUsers) {
      users[user.id] = user;
    }
    if (Object.keys(users).length > maxCount) break;
  }
  return Object.values(users);
}

async function getFeaturedCollections(featuredCollections) {
  // TODO: where should this actually be configured?
  const styleNames = ['wavey', 'diagonal', 'triangle'];
  const fullUrls = featuredCollections.map(({ fullUrl }) => `fullUrl=${fullUrl}`).join('&');
  try {
    const { data: collections } = await api.get(`/v1/collections/by/fullUrl?${fullUrls}`)

    const collectionsWithData = featuredCollections.map(async ({ fullUrl, title, description, style }, i) => {
      const collection = collections[fullUrl];
      const projects = await getAllPages(`/v1/collections/by/fullUrl/projects?fullUrl=${fullUrl}&limit=100`);
      const users = await getUniqueUsersInProjects(projects, 5);

      return {
        title: title || collection.name,
        description: description || collection.description,
        fullUrl,
        users: users.map(trimUserProps),
        count: projects.length,
        collectionStyle: style || styleNames[i],
      };
    });  

    const withData = await Promise.all(collectionsWithData);
    return withData;
  } catch (e) {
    return featuredCollections.map((collection, i) => ({
      ...collection,
      users: [],
      count: 0,
      collectionStyle: styleNames[i],
    }));
  }
}

async function getFeaturedProjects(featuredProjects) {
  const domains = featuredProjects.map((p) => `domain=${p.domain}`).join('&');
  const { data: projectData } = await api.get(`/v1/projects/by/domain?${domains}`);
  const projectsWithData = featuredProjects.map(async ({ title, img, domain, description }) => {
    const project = projectData[domain];
    const users = await getAllPages(`/v1/projects/by/domain/users?domain=${domain}&limit=100`);
    return {
      domain,
      title,
      img,
      users: users.slice(0, 10).map(trimUserProps),
      description: description || project.description,
    };
  });
  return Promise.all(projectsWithData);
}

async function getHomeData() {
  const rawData = JSON.parse(await fs.readFile('.data/home.json'))
  
  const data = await allByKeys({
    curatedCollections: getFeaturedCollections(rawData.curatedCollections),
    appsWeLove: getFeaturedProjects(rawData.appsWeLove),
  });
  return { ...rawData, ...data };
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

