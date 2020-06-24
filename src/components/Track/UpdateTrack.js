import React, {useState, useContext} from "react";
import withStyles from "@material-ui/core/styles/withStyles";
 import IconButton from "@material-ui/core/IconButton";
 import EditIcon from "@material-ui/icons/Edit";
 import Button from "@material-ui/core/Button";
 import TextField from "@material-ui/core/TextField";
 import Dialog from "@material-ui/core/Dialog";
 import DialogActions from "@material-ui/core/DialogActions";
 import DialogContent from "@material-ui/core/DialogContent";
 import DialogContentText from "@material-ui/core/DialogContentText";
 import FormControl from "@material-ui/core/FormControl";
 import FormHelperText from "@material-ui/core/FormHelperText";
 import DialogTitle from "@material-ui/core/DialogTitle";
 import CircularProgress from "@material-ui/core/CircularProgress";
 import LibraryMusicIcon from "@material-ui/icons/LibraryMusic";
 import { Mutation } from 'react-apollo';
import { gql } from 'apollo-boost';
import Error from '../Shared/Error';
import Loading from '../Shared/Loading';
import axios from 'axios'
import {GET_TRACKS_QUERY} from '../../pages/App'
import { UserContext } from "../../Root";

 const UpdateTrack = ({ classes, track }) => {
   const currentUser = useContext(UserContext)
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState(track.title)

  const [description, setDescription] = useState(track.description)
  const [file, setFile] = useState("")
  const [fileError, setFileError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const isCurrentUser = currentUser.id === track.postedBy.id

  const handleAudioChange = event => {

    const selectedFile = event.target.files[0]
    const fileSizeLimit = 10000000 //10mb
    if (selectedFile && selectedFile.size > fileSizeLimit){
      setFileError(`${selectedFile.name}:File Size is too large`)
    } else {
    setFile(selectedFile)
    setFileError("")
    }
  }
  const handleAudioUpload = async () => {
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("resource_type", "raw");
      data.append("upload_preset", "react-tracks");
      data.append("cloud_name", "dlnrxev2c");
      const res = await axios.post(
        " https://api.cloudinary.com/v1_1/dlnrxev2c/raw/upload",
        data
      );
      return res.data.url;
    } catch (err) {
      console.error("Error uploading file", err);
      setSubmitting(false);
    }
  };
  const handleSubmit = async (event,updateTrack) =>{
    event.preventDefault()
    setSubmitting(true)
    const uploadedUrl = await handleAudioUpload()
    updateTrack({variables:{trackId:track.id,title,description,url:uploadedUrl}})
  }

    return isCurrentUser &&(
    <>
    <IconButton onClick={() => setOpen(true)}>
      <EditIcon />
    </IconButton>
      <Mutation mutation={UPDATE_TRACK_MUTATION}
      onCompleted={data =>{
        console.log({data})
        setOpen(false)
        setSubmitting(false)
        setTitle("")
        setDescription("")
        setFile("");
      }}
      //refetchQueries={() => [{query:GET_TRACKS_QUERY}]}
      >
      
        {(updateTrack, {loading, error})=>{
          if (error) return <Error error={error} />
          return (
            <Dialog open={open} className={classes.dialog}>
      <form
      onSubmit={event => handleSubmit(event, updateTrack)}
      >
        <DialogTitle>Update Track
        </DialogTitle>
        <DialogContent>
        <DialogContentText>
        Add a Title, Description & Audio File
        </DialogContentText>
        <FormControl fullWidth>
          <TextField 
          multiline
          rows="2"
          onChange={(event)=>setTitle(event.target.value)}
          value={title}
          label="Title" 
          placeholder="Add Title"
          className={classes.textField}
          />
        </FormControl>
        <FormControl fullWidth>
          <TextField 
          label="Description"
          value={description}
          onChange={(event)=>setDescription(event.target.value)}

          placeholder="Add Description"
          className={classes.textField}
          />
        </FormControl>
        <FormControl error={Boolean(fileError)}>
          <input 
            id="audio"
            required
            onChange ={handleAudioChange}
            type="file"
            accept="audio/*"
            className={classes.input}
          />
          <label htmlFor="audio">
          <Button variant="outlined" color={file ? "secondary" : "inherit"}
          component="span"
          className={classes.button}
          >
            Audio File
            <LibraryMusicIcon className={classes.icon} />
          </Button>
          {file && file.name}
          <FormHelperText>{fileError}</FormHelperText>
          </label>
        </FormControl>
        </DialogContent>
        <DialogActions>
          <Button
          disabled={submitting}
          onClick={()=>setOpen(false)}
          className={classes.cancel}>Cancel</Button>
          <Button
          type="submit"
          disabled={
            submitting||!title.trim()||!description.trim() ||!file
          }
          className={classes.save}>
            {submitting ?(
              <CircularProgress className={classes.save} size={24} />
            ):("Update Track")}
          </Button>
        </DialogActions>

      </form>
    </Dialog>        
          )
        }}
      </Mutation>
    
    </>

  );
};

const UPDATE_TRACK_MUTATION = gql `
mutation($trackId: Int!, $title:String,$url:String,$description:String ){
  updateTrack(
    trackId: $trackId,
    title:$title,
    url:$url,
    description:$description
  ){
    track{
      id
      title
      url
      description

    }
  }
}
`


const styles = theme => ({
  container: {
    display: "flex",
    flexWrap: "wrap"
  },
  dialog: {
    margin: "0 auto",
    maxWidth: 550
  },
  textField: {
    margin: theme.spacing.unit
  },
  cancel: {
    color: "red"
  },
  save: {
    color: "green"
  },
  button: {
    margin: theme.spacing.unit * 2
  },
  icon: {
    marginLeft: theme.spacing.unit
  },
  input: {
    display: "none"
  }
});

export default withStyles(styles)(UpdateTrack);
