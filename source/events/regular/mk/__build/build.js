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

const rewardType2Name = {
  'Armor': 'Blueprint',
  'Magic': 'Magic Dust',
  'Weapon': 'Forge Blueprint',
  'Summon': 'Magic Book',
};

const rewardName2Type = {
  'Blueprint': 'Armor',
  'Magic Dust': 'Magic Stone',
  'Forge Blueprint': 'Weapon',
  'Magic Book': 'Summon Monster',
};

namesData.forEach((row) => {
  const [
    RewardName,
    Tier,
    RewardDesc,
  ] = row.split('\t');
  namesLookup.push({
    name: RewardName.trim(),
    tier: parseInt(Tier),
    desc: RewardDesc.trim(),
  });
});

/**
 * Find reward desc
 * @param {string} rewardName
 * @param {number} rewardTier
 * @return {string}
 */
function findRewardDesc(rewardName, rewardTier) {
  const namesData = namesLookup.find((data) => (
    (data.name === rewardName) && (data.tier === rewardTier)
  ));
  if (namesData) return namesData.desc;

  if (rewardName !== 'Magic Dust') {
    console.log(`reward name not found (T${rewardTier} ${rewardName})`);
  }

  return 'T' + rewardTier + ' ' + rewardName2Type[rewardName];
}

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

  const RewardClass = RewardType.toLowerCase();
  // const historical = Historical === 'TRUE';
  const predicted = Predicted === 'TRUE';
  let rewardTier = parseInt(RewardTier);
  let rewardDesc;

  const RewardName = rewardType2Name[RewardType];

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

  rewardDesc = findRewardDesc(RewardName, rewardTier);
  content = content
      .replace('{{REWARD 1}}', 'T' + rewardTier + ' ' + RewardName)
      .replace('{{REWARD 1 DESC}}', rewardDesc)
  ;

  rewardTier--;
  rewardDesc = findRewardDesc(RewardName, rewardTier);
  content = content
      .replace('{{REWARD 2}}', 'T' + rewardTier + ' ' + RewardName)
      .replace('{{REWARD 2 DESC}}', rewardDesc)
  ;

  rewardTier -= 2;
  rewardDesc = findRewardDesc(RewardName, rewardTier);
  content = content
      .replace('{{REWARD 3}}', 'T' + rewardTier + ' ' + RewardName)
      .replace('{{REWARD 3 DESC}}', rewardDesc)
  ;

  sections.push(content);
});

writeFileSync(
    '../__templates/--all-seasons.md',
    sections.join('\n'),
);
