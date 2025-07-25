---
title       : Blank Alliance Mail
short-title : Blank Mail
index  : true
topics : [Mail]
desc   : >
  Compose and preview an Alliance Mail message
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
{{<./__templates/__toolbar-mail.html>}}
<textarea id="input" placeholder="Enter your Alliance Mail message"></textarea>
</section>

<section id="preview-pane">
<h2>Preview</h2>
<div id="output" class="mail"></div>
</section>
</div>
{{<./__templates/__note.html>}}
