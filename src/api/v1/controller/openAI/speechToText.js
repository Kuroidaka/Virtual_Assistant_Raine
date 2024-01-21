const speechToTextController = (dependencies) => {

    const { openAi } = dependencies;

    return async (req, res) => { 
     
        try {
            const file = req.files[0];
            const lang = req.query.lang;

            const transcription = await openAi.audio.transcriptions.create({
              file,
              model: "whisper-1",
              language: lang || undefined,
            });
          
            console.log(transcription);
            
            return res.status(200).json({data: transcription.text})
        } catch (error) {
            return res.status(500).json({ error: error });
        }
   
    }
}

module.exports = speechToTextController;