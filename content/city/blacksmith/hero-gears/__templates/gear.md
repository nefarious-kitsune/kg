<html>
<head>
<title>{{ITEM NAME}}</title>
<meta page-data
  og-desc="Upgrade cost and power bonus of {{ITEM NAME EXPANDED}}"
  tag-list="blacksmith"
>
<meta name="viewport" content="width=device-width,initial-scale=1">
<link href="/assets/css/common.css" rel="stylesheet">
<link href="/assets/hint/hint.css" rel="stylesheet">
<script src="/assets/hint/hint.js"></script>
<style>
.overview-subsection {
  min-width: 10rem;
  margin-block-end: 0.8rem;
}
.overview-subsection h4 {
  margin-block-start: 0;
  margin-block-end: 0.8rem;
}
.overview-subsection {
  break-inside: avoid;
}
#overview {
  column-width: 12rem;
}

</style>
</head>
<body>

<header><nav><menu class="breadcrumb">
  <li><a href="/content">Home</a></li>
  <li><a href="/city">City</a></li>
  <li><a href="/city/blacksmith">Blacksmith</a></li>
  <li><a href="/city/blacksmith/hero-gears">Hero Gears</a></li>
  <li>{{ITEM NAME}}</li>
</menu></nav></header>

<main>
<h1>{{ITEM NAME}}</h1>

<section id="overview">
<div class="overview-subsection"><h4>Gears</h4><ul class="min-list">
  <li>{{GEAR NAME 1}}</li>
  <li>{{GEAR NAME 2}}</li>
  <li>{{GEAR NAME 3}}</li>
  <li>{{GEAR NAME 4}}</li>
</ul></div>

<div class="overview-subsection"><h4><a href="#power-bonus">Max Power</a></h4><ul class="min-list">
  <li><span class="{{MAX BONUS CLASS}}">{{MAX BONUS}}</span><span class="unit">%</span></li>
</ul></div>

<div class="overview-subsection"><h4><a href="#upgrade">Upgrade Cost</a></h4><ul class="min-list">
  <li><span class="{{TOTAL COST CLASS}}">{{TOTAL COST 1}}</span> Elemental Vials</li>
  <li><span class="{{TOTAL COST CLASS}}">{{TOTAL COST 2}}</span> Blood of Titan</li>
</ul></div>
</section>

<section id="upgrade">
<h2>Level Upgrade</h2>

<p>The total upgrade cost for a {{ITEM NAME}} is
<span class="{{TOTAL COST CLASS}}">{{TOTAL COST 1}}</span>
<span --has-hint --hint-ref="res-elemental-vial">Elemental Vials</span> and
<span class="{{TOTAL COST CLASS}}">{{TOTAL COST 2}}</span>
<span --has-hint --hint-ref="res-blood-of-titan">Blood of Titan</span>.</p>

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
</section>

<section id="power-bonus">
<h2>Power Bonus</h2>

<p>A {{ITEM NAME}} can provide the equipped Hero with
a maximum Hero Gear Power of
<span class="{{MAX BONUS CLASS}}">{{MAX BONUS}}</span><span class="unit">%</span>
of the <a href="../base/#power">Blacksmith Base Power</a>.</p>

<div class="col-flex">
<table class="basic-table power-table sticky-header">
<thead>
<tr>
  <th class="from-level">Level</th>
  <th class="power-bonus">Power Bonus</th>
</tr>
</thead>
<tbody>
{{POWER BODY 1}}
</tbody>
</table>

<table class="basic-table power-table sticky-header">
<thead>
<tr>
  <th class="from-level">Level</th>
  <th class="power-bonus">Power Bonus</th>
</tr>
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
