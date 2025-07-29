---
title       : Tech Donation Reminder
short-title : Tech Reminder
index  : true
topics : [Mail]
desc   : >
  Compose a reminder mail for Alliance Tech donation
layout: editor
css:
js:
css-code : >
prev:
next:
---
<p>{{PAGE-DESC}}</p>

<div class="editor-container">
<section id="edit-pane">
<h2>Edit</h2>
{{<./editor/__mail_toolbar.html>}}
<fragment src=""/>
<textarea id="input"
  placeholder="Enter your Alliance Mail message"
  >{{<./__mail/alliance-tech-reminder.txt>}}</textarea
>
</section>

<section id="preview-pane">
<h2>Preview</h2>
<div id="output" class="mail"></div>
</section>
</div>
{{<./__templates/__note.html>}}
