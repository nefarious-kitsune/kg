import {readFileSync, writeFileSync} from 'fs';

const namesData = readFileSync('../__data/names.tsv', {encoding: 'utf8'})
    .split('\n');

const rewardsData = readFileSync('../__data/mk-rewards.tsv', {encoding: 'utf8'})
    .split('\n');

const sectionTemplate =
  readFileSync('../__templates/reward-section.md', {encoding: 'utf8'});

rewardsData.shift();
rewardsData.shift();

const namesLookup = [];

namesData.forEach((row) => {
  const [
    RewardName,
    Tier,
    RewardDesc,
  ] = row.split('\t');
  namesLookup.push({
    name: RewardName,
    tier: parseInt(Tier),
    desc: RewardDesc,
  });
});

const sections = [];

rewardsData.forEach((row) => {
  const [
    SeasonName,
    // eslint-disable-next-line no-unused-vars
    Historical,
    Predicted,
    RewardType,
    RewardTier,
  ] = row.split('\t');

  let content = sectionTemplate;

  let RewardName;
  const RewardClass = RewardType.toLowerCase();
  // const historical = Historical === 'TRUE';
  const predicted = Predicted === 'TRUE';
  let rewardTier = parseInt(RewardTier);

  switch (RewardClass) {
    case 'armor':
      RewardName = 'Blueprint';
      break;
    case 'magic':
      RewardName = 'Magic Dust';
      break;
    case 'weapon':
      RewardName = 'Forge Blueprint';
      break;
    case 'summon':
      RewardName = 'Magic Book';
      break;
  }

  content = content
      .replace('{{SEASON NAME}}', SeasonName)
      .replace('{{SEASON REWARD}}', RewardName)
      .replace('{{CLASS}}', RewardClass)
  ;

  if (predicted) {
    content = content.replaceAll('{{VERIFIED}}', 'unverified');
  } else {
    content = content.replaceAll('{{VERIFIED}}', 'verified');
  }

  let namesData = namesLookup.find((data) => (
    (data.name === RewardName) && (data.tier === rewardTier)
  ));

  content = content
      .replace('{{REWARD 1}}', 'T' + rewardTier + ' ' + RewardName)
      .replace('{{REWARD 1 DESC}}', namesData.desc)
  ;

  rewardTier--;
  namesData = namesLookup.find((data) => (
    (data.name === RewardName) && (data.tier === rewardTier)
  ));
  content = content
      .replace('{{REWARD 2}}', 'T' + rewardTier + ' ' + RewardName)
      .replace('{{REWARD 2 DESC}}', namesData.desc)
  ;

  rewardTier -= 2;
  namesData = namesLookup.find((data) => (
    (data.name === RewardName) && (data.tier === rewardTier)
  ));
  content = content
      .replace('{{REWARD 3}}', 'T' + rewardTier + ' ' + RewardName)
      .replace('{{REWARD 3 DESC}}', namesData.desc)
  ;

  sections.push(content);
});

writeFileSync(
    '../__templates/--all-seasons.md',
    sections.join('\n'),
);

