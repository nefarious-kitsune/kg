<html>
<head>
<title>T{{TIER}} Hero Gear</title>
<meta page-data
  og-desc="Upgrade cost and power bonus of T{{TIER}} Hero Gear ({{TIER DESC}})"
  tag-list="blacksmith"
>
<meta name="viewport" content="width=device-width,initial-scale=1">
<link href="../../../assets/css/common.css" rel="stylesheet">
</head>
<body>

<header><nav><menu class="breadcrumb">
  <li><a href="/content">Home</a></li>
  <li><a href="/city">City</a></li>
  <li><a href="/city/blacksmith">Blacksmith</a></li>
  <li><a href="/city/blacksmith/hero-gears">Hero Gears</a></li>
  <li>T{{TIER}} Hero Gear</li>
</menu></nav></header>

<main>
<h1>T{{TIER}} Hero Gear</h1>

<section>
<p>A T{{TIER}} Hero Gear ({{TIER DESC}}) can be crafted from
<span class="number">100</span> T{{TIER}}
<a href="/resources/forge-blueprints/">Forge Blueprints</a>.</p>
</section>

<section id="upgrade">
<h2>Level Upgrade</h2>

<p>The total upgrade cost for a T{{TIER}} Hero Gear is
<span class="number">{{TOTAL COST 1}}</span> Elemental Vial and
<span class="number">{{TOTAL COST 2}}</span> Blood of Titan.</p>

<div class="col-flex">

<table class="basic-table upgrade-table sticky-header">
<thead>
<th class="from-level">From</th>
  <th class="chevron"></th>
  <th class="to-level">To</th>
  <th class="upgrade-cost">Elemental Vial</th>
  <th class="upgrade-cost">Blood of Titan</th>
</thead>
<tbody>
{{UPGRADE BODY}}
</tbody>
</table>
</div>
</section>

<section id="power">
<h2>Hero Gear Power</h2>

<p>The maximum Hero Gear Power from a T{{TIER}} Hero Gear is
<span class="number">{{MAX POWER BONUS}}</span><span class="unit">%</span>
of <a href="../base/">Blacksmith Base Power</a>.</p>

<div class="col-flex">
<table class="basic-table power-table sticky-header">
<thead>
<tr><th class="from-level">Level</th><th class="power">Power</th></tr>
</thead>
<tbody>
{{POWER BODY 1}}
</tbody>
</table>

<table class="basic-table power-table sticky-header">
<thead>
<tr><th class="from-level">Level</th><th class="power">Power</th></tr>
</thead>
<tbody>
{{POWER BODY 2}}
</tbody>
</table>

</div>
</section>
<nav class="left-right">
{{PREV LINK}}
{{NEXT LINK}}
</nav>

</main>

</body>
</html>
