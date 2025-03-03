<html>
<head>
<title>T{{TIER}} Hero Gear</title>
<meta page-data
  og-desc="Leveling and Power of T{{TIER}} Hero Gear ({{TIER DESC}})"
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

<div class="quick-access-container"><menu>
  <li><a href="#leveling">Leveling</a></li>
  <li><a href="#power-bonus">Power Bonus</a></li>
</menu></div>

<section>
<p>A T{{TIER}} Hero Gear ({{TIER DESC}}) provides maximum
<span class="number">{{MAX POWER BONUS}}</span><span class="unit">%</span>
power bonus and requires a total leveling cost of
<span class="number">{{TOTAL COST 1}}</span> Elemental Vial and
<span class="number">{{TOTAL COST 2}}</span> Blood of Titan.</p>
</section>

<section id="leveling">
<h2>Leveling</h2>
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
<h2>Power Bonus</h2>

<div class="col-flex">
<table class="basic-table power-table sticky-header">
<thead>
<tr><th class="from-level">Level</th><th class="power">Power</th></tr>
</thead>
<tbody>
{{POWER BODY1}}
</tbody>
</table>

<table class="basic-table power-table sticky-header">
<thead>
<tr><th class="from-level">Level</th><th class="power">Power</th></tr>
</thead>
<tbody>
{{POWR BODY2}}
</tbody>
</table>

</div>
</section>

</main>

</body>
</html>
