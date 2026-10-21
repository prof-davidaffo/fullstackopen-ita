window.onload = function () {
  var basePath =
    window.location.pathname.split('/exampleapp')[0] + '/exampleapp/'
  var xhttp = new XMLHttpRequest()

  xhttp.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
      var data = JSON.parse(this.responseText)
      console.log(data)

      var ul = document.createElement('ul')
      ul.setAttribute('class', 'notes')

      data.forEach(function (note) {
        var li = document.createElement('li')
        ul.appendChild(li)
        li.appendChild(document.createTextNode(note.content))
      })

      document.getElementById('notes').appendChild(ul)
    }
  }

  xhttp.open('GET', basePath + 'data.json', true)
  xhttp.send()
}
