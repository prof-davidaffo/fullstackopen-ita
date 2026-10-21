var notes = []

var redrawNotes = function () {
  var ul = document.createElement('ul')
  ul.setAttribute('class', 'notes')

  notes.forEach(function (note) {
    var li = document.createElement('li')
    ul.appendChild(li)
    li.appendChild(document.createTextNode(note.content))
  })

  var notesElement = document.getElementById('notes')
  if (notesElement.hasChildNodes()) {
    notesElement.removeChild(notesElement.childNodes[0])
  }
  notesElement.appendChild(ul)
}

var startApplication = function () {
  var basePath =
    window.location.pathname.split('/exampleapp')[0] + '/exampleapp/'
  var xhttp = new XMLHttpRequest()

  xhttp.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
      notes = JSON.parse(this.responseText)
      redrawNotes()
    }
  }

  xhttp.open('GET', basePath + 'data.json', true)
  xhttp.send()

  var sendToServer = function (note) {
    var request = new XMLHttpRequest()
    request.onreadystatechange = function () {
      if (this.readyState === 4 && this.status === 201) {
        console.log(this.responseText)
      }
    }

    request.open('POST', basePath + 'new_note_spa', true)
    request.setRequestHeader('Content-type', 'application/json')
    request.send(JSON.stringify(note))
  }

  var form = document.getElementById('notes_form')
  form.onsubmit = function (event) {
    event.preventDefault()

    var note = {
      content: event.target.elements[0].value,
      date: new Date(),
    }

    notes.push(note)
    event.target.elements[0].value = ''
    redrawNotes()
    sendToServer(note)
  }
}

window.onload = startApplication
