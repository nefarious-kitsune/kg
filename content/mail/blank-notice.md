---
title       : Blank Text Notice
short-title : Blank Notice
index  : true
topics : [Mail]
desc   : >
  Compose and preview an Text Notice message
variables:
  MAX CHAR COUNT: 100
  MESSAGE TITLE: Blank text notice
  MESSAGE BODY: >
    <color=#222><size=50>At reset (UTC 0000), please remember
    to <b>refresh your Alliance Challenge until all quests are
    SSR (<color=#F50>gold</color>)</size></color>
layout: editor
css:
js:
prev:
next:
---
<div class="editor-container">
<section id="edit-pane">
<h2>Edit</h2>
{{<./editor/__announcement_toolbar.html>}}
</section>

<section id="preview-pane">
<h2>Preview</h2>
<div id="output" class="notice"></div>
</section>
</div>
{{<./__templates/__note.html>}}
