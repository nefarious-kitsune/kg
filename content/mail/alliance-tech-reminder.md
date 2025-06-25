---
title       : Tech Donation Mail Template
short-title : Tech Donation Mail
index  : true
topics : [Mail Template]
desc   : >
  Mail template for reminding people to do Alliance Tech donation
css:
  - ./mail.css
  - /assets/toolbars/toolbars.css
js:
  - ./mail.js
  - ./parser.js
  - /assets/toolbars/toolbars.js
prev:
next:
---
<p>{{PAGE-DESC}}</p>

<div class="editor-container">
<section id="edit-pane">
<h2>Edit</h2>
{{<./__templates/__toolbar-mail.html>}}
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
