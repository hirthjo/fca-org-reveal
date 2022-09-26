$(document).ready(function() { 
  $('.context').DataTable( { 
    ordering: true, 
    bSort: false, 
    searching: false, 
    paging: false, 
    info: false, 
    "columnDefs": [ { "visible": false, "targets": 0}, 
                    { "sortable": false, "targets": "_all" }], 
    colReorder: true, 
    rowReorder: { 
      selector: ".obj", 
      snapX: 10 
    } 
  } ); 

  $('.incidence').click(function() { 
    var color = $(this).css("color"); 
    if ($(this).hasClass("marked-incidence")) { 
      $(this).removeClass("marked-incidence") 
    } else { 
      $(this).addClass("marked-incidence"); 
    } 
  }); 
} ); 
