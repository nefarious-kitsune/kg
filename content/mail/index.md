---
title       : Alliance Mail and Messages
short-title : Mail
index  : true
topics : [Mail]
desc   : >
  Information and tool on Alliance Mail and Alliance Board messages
css:
js:
css-code : >
  .template-list-container {
    column-width: 18rem;
  }

  ul.template-list {
    margin: 0;
    padding: 0;
    margin-bottom: 0;
    margin-top: 0;

    li {
      list-style: none;
      -webkit-column-break-inside: avoid;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    li.notice:before {
      content: "N";
      background-color: var(--primary-1);
    }

    li.mail:before {
      content: "M";
      color: white;
      background-color: var(--primary-3);
    }

    li:before {
      display: inline-block;
      width: 1rem;
      text-align: center;
      font-size: 0.7rem;
      font-weight: normal;
      font-style: normal;
      border-radius: 0.2rem;
      margin-right: 0.2rem;
      padding: 0.1rem;
      vertical-align: middle;
    }
  }
prev:
next:
---
