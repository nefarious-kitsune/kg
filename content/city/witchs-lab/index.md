---
title       : Witch's Lab
short-title : Witch's Lab
index  : true
topics : [City, Witch's Lab, Magic Power]
desc   : >
  Witch's Lab unlocks about 30–36 days after server opening.
  The building provides Magic Power through
  Light Magic, Dark Magic, and Magic Stones….
css:
  - /assets/hint/hint.css
  - /assets/modal/model.css
js:
  - /assets/hint/hint.js
  - /assets/modal/model.js # Remember to embed /__templates/modal-container.md
css-code : >
  .intro {
    background-image: url("/assets/icons/building-witchs-lab.png");
    background-size: 6rem auto;
    background-position: right 1rem top 1rem;
    background-repeat: no-repeat;
    p:first-child { margin-right: 7rem; }
  }
prev:
next:
---
<div class="quick-access-container"><menu>
  <li><a href="#light-magic">Light Magic</a></li>
  <li><a href="#dark-magic">Dark Magic</a></li>
  <li><a href="#magic-stones">Magic Stones</a></li>
  <li><a href="#screenshots">Screenshots</a></li>
</menu></div>

{{</__templates/modal-container.md>}}
<div class="intro">
{{<../__snippets/witchs-lab-intro.md>}}
<!--
<p>Light/Dark Magic Power can be <em>extended</em> with
Magic Stones,
Summon Altar,
etc.</p>
-->

<div class="notice alert-info">Light and Dark Magic <strong>do not</strong>
need to be balanced.</div>
</div>

<section id="light-magic">
<h2>Light Magic</h2>
<p>{{<../__snippets/light-magic-upgrade.md>}}</p>
<p>See <a href="./light-magic/">Light Magic</a></p>
</section>

<section id="dark-magic">
<h2>Dark Magic</h2>
<p><a href="./dark-magic/">Dark Magic</a> Power can be enhanced by
obtaining Dark Reagent through PvP battles.
Dark Magic level upgrade is <em>automatic</em></p>
</section>

<section id="magic-stones">
<h2>Magic Stones</h2>
<p>Light Magic and Dark Magic Powers can be enhanced with
<a href="./magic-stones/">Magic Stones</a>.
Each Magic Stone requires 100 <a href="./magic-dusts/">Magic Dust</a></p>
</section>

<section id="screenshots">
<h2>Screenshots</h2>
</section>
