$(document).ready(function() { 
  //  editable code lines
  $('.hljs-ln-code').attr("contentEditable", "true");

  var HUB = MathJax.Hub;
  var idx =1;
  $(".hljs-ln-code").each(function() {
    var render_id = "render-me"+idx;
    $(this).attr("id",render_id);
    HUB.Queue(["Typeset",HUB,render_id]);
    idx = idx +1;
  });
  $(".hljs-ln-header").each(function() {
    var render_id = "render-me"+idx;
    $(this).attr("id",render_id);
    HUB.Queue(["Typeset",HUB,render_id]);
    idx = idx +1;
  });
    $(".make-latex").each(function() {
    var render_id = "render-me"+idx;
    $(this).attr("id",render_id);
    HUB.Queue(["Typeset",HUB,render_id]);
    idx = idx +1;
  });
} ); 

