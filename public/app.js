(function() {
  var converter = new Showdown.converter();

  var CommentBox = React.createClass({
    // Sets the initial state of the component
    getInitialState: function() {
      return {
        data: []
      };
    },
    // Called when the component is rendered
    componentDidMount: function() {
      this.loadCommentsFromServer();
      setInterval(this.loadCommentsFromServer, this.props.pollInterval);
    },
    loadCommentsFromServer: function() {
      $.ajax({
        url: this.props.url,
        dataType: 'json',
        success: function(data) {
          this.setState({data: data});
        }.bind(this),
        error: function(xhr, status, err) {
          console.error(this.props.url, status, err.toString());
        }.bind(this),
      });
    },
    handleCommentSubmit: function(comment) {
      var comments = this.state.data,
      newComments = comments.concat([comment]);
      this.setState({data: newComments}); //Optimistically setting the data before the ajax request

      $.ajax({
        url: this.props.url,
        dataType: 'json',
        type: 'POST',
        data: comment,
        success: function(data) {
          this.setState({data: data});
        }.bind(this),
        error: function(xhr, status, err) {
          console.error(this.props.url, status, err.toString());
        }.bind(this),
      });
    },
    render: function() {
      return (
          <div className="commentBox">
          <h1>Comments</h1>
          <CommentList data={this.state.data} />
          <CommentForm onCommentSubmit={this.handleCommentSubmit}/>
          </div>
          );
    }
  });

  var CommentList = React.createClass({
    createCommentNodes: function() {
      return this.props.data.map(function(comment, i) {
        return (
            <Comment author={comment.author} key={i}>
            {comment.text}
            </Comment>
            );
      });
    },
    render: function() {
      var commentNodes = this.createCommentNodes();
      return (
          <div className="commentList">
          {commentNodes}
          </div>
          );
    }
  });

  var CommentForm = React.createClass({
    handleSubmit: function(e) {
      e.preventDefault();
      var author = this.refs.author.getDOMNode().value.trim(),
      text = this.refs.text.getDOMNode().value.trim();
      if (!text || !author) {
        return;
      }
      //Call the callback from the parent (CommentBox)
      this.props.onCommentSubmit({author: author, text: text});
      this.refs.author.getDOMNode().value = '';
      this.refs.text.getDOMNode().value = '';
      return;
    },
    render: function() {
      return (
          <form className="commentForm" onSubmit={this.handleSubmit}>
          <input type="text" placeholder="Your name" ref="author"/>
          <input type="text" placeholder="Say something..." ref="text"/>
          <input type="submit" value="Post" />
          </form>
          );
    }
  });

  var Comment = React.createClass({
    render: function() {
      var rawMarkup = converter.makeHtml(this.props.children.toString());
      return (
          <div className="comment">
          <h2 className="commentAuthor">{this.props.author}</h2>
          <span dangerouslySetInnerHTML={{__html: rawMarkup}} />
          </div>
          );
    }
  });


  // Start everything
  React.render(
      <CommentBox url="comments.json" pollInterval={2000}/>,
      document.getElementById('content')
      );
}());
