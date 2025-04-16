---
title       : T{{TIER}} Magic Stones
short-title : T{{TIER}} Magic Stones
index  : true
topics : [Magic Stones]
desc   : >
  Upgrade cost and power bonus of T{{TIER}} Magic Stones
js:
  - /assets/hint/hint.js
css:
  - /assets/hint/hint.css
  - /city/dragonden/armors/gears.css
pagination:
{{PAGINATION-LINKS}}
---
<section class="gear-overview" id="overview">

<div class="gear-list">
<ul class="compact-list">
  <li>{{GEAR-NAME-1}}</li>
  <li>{{GEAR-NAME-2}}</li>
  <li>{{GEAR-NAME-3}}</li>
  <li>{{GEAR-NAME-4}}</li>
  <li>&hellip;</li>
</ul></div>

<div class="gear-stats">
<dl class="two-column">
  <dt><a href="#power-bonus">Max Power</a></dt>
  <dd><span class="{{MAX-BONUS-CLASS}}">{{MAX-BONUS}}</span><span class="unit">%</span></dd>

  <dt><a href="#upgrade">Total Upgrade</a></dt>
  <dd><ul class="compact-list">
    <li><span class="{{TOTAL-COST-CLASS}}">{{TOTAL-COST-1}}</span> Strengthening Potion</li>
    <li><span class="{{TOTAL-COST-CLASS}}">{{TOTAL-COST-2}}</span> Fortune Potion</li>
  </ul></dd>
</dl>
</div>
</section>

<section id="upgrade">
<h2>Upgrade</h2>
<div class="upgrade-grid">
<div class="header level"><!-- Level --></div>
<div class="header cost"><span --has-hint
  --hint-ref="res-strengthening-potion">Strengthening Potion</span></div>
<div class="header cost"><span --has-hint
  --hint-ref="res-fortune-potion">Fortune Potion</span></div>
{{UPGRADE-BODY}}
</div>
</section>

<section id="power-bonus">
<h2>Power Bonus</h2>

<p>Each T{{TIER}} can provide Magic Stone Power that is
a certain percentage of the <a href="../magic/">Magic Power</a>.</p>

<div class="col-flex">
<div class="power-grid">
<div class="header level"><!-- Level --></div>
<div class="header power-bonus">Power Bonus</div>
{{POWER-BODY-1}}
</div>
<div class="power-grid">
<div class="header level"><!-- Level --></div>
<div class="header power-bonus">Power Bonus</div>
{{POWER-BODY-2}}
</div>
</div>
</section>
