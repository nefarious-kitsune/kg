---
title       : Blank Text Notice
short-title : Blank Notice
index  : true
topics : [Mail]
desc   : >
  Compose and preview an Text Notice message
layout: editor
css:
js:
css-code : >
prev:
next:
---
<div class="editor-container">
<section id="edit-pane">
<h2>Edit</h2>
{{<./editor/__mail_toolbar.html>}}
<textarea id="input" placeholder="Enter your Alliance Mail message"></textarea>
</section>

<section id="preview-pane">
<h2>Preview</h2>
<div id="output" class="notice"></div>
</section>
</div>
{{<./__templates/__note.html>}}
