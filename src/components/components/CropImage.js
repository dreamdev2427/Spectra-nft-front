import React, { Component } from "react";
import ReactCrop from "react-image-crop";
import { styled } from '@mui/material/styles';
import "react-image-crop/dist/ReactCrop.css";
import Button from '@mui/material/Button';

const Input = styled('input')({
    display: 'none',
});

export default class CropImage extends Component {
    state = {
        src: null,
        crop: {
            unit: "%",
            width: 80,
            aspect: 1
        },
        isCropped: false,
    };

    onSelectedFile = (e) => {
        this.setState({isCropped: false});
        if (e.target.files && e.target.files.length > 0) {
            const reader = new FileReader();
            reader.addEventListener("load", () =>
                this.setState({ src: reader.result })
            );
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    // If you setState the crop in here you should return false.
    onImageLoaded = (image) => {
        this.setState({croppedImageUrl: ''});
        this.imageRef = image;
    };

    onCropComplete = (crop) => {
        this.makeClientCrop(crop);
    };

    onCropChange = (crop, percentCrop) => {
        // You could also use percentCrop:
        // this.setState({ crop: percentCrop });
        this.setState({ crop });
    };

    async makeClientCrop(crop) {
        if (this.imageRef && crop.width && crop.height) {
            const croppedImageUrl = await this.getCroppedImg(
                this.imageRef,
                crop,
                "Avatar.jpeg"
            );
            this.setState({ croppedImageUrl });
            
        }
    }

    getCroppedImg(image, crop, fileName) {
        const canvas = document.createElement("canvas");
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        canvas.width = crop.width;
        canvas.height = crop.height;
        const ctx = canvas.getContext("2d");

        ctx.drawImage(
            image,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            crop.width,
            crop.height
        );

        return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (!blob) {
                    //reject(new Error('Canvas is empty'));
                    console.error("Canvas is empty");
                    return;
                }
                blob.name = fileName;
                window.URL.revokeObjectURL(this.fileUrl);
                this.fileUrl = window.URL.createObjectURL(blob);
                resolve(this.fileUrl);
            }, "image/jpeg");
        });
    }

    onCropImage = () => {
        this.setState({isCropped: true});
        const { handleChange } = this.props;
        handleChange(this.state.croppedImageUrl);
    }

    render() {
        const { crop, src, croppedImageUrl, isCropped } = this.state;
        return (
            <div className="lazy avatar_crop" style={{textAlign:'center', border:"dashed 1px #28196c", borderRadius:"10px", marginBottom:'20px'}}>
                { !isCropped && !src && (
                    <div style={{height: '180px'}}>
                        <h2 style={{lineHeight: '5', color: '#aaa'}}>Please upload avatar image.</h2>
                    </div>
                )}
                { !isCropped && src && (
                    <ReactCrop
                        style={{minHeight: '180px', maxWidth:'180px', maxHeight:'180px'}}
                        src={src}
                        crop={crop}
                        circularCrop
                        onImageLoaded={this.onImageLoaded}
                        onComplete={this.onCropComplete}
                        onChange={this.onCropChange}
                    />
                )}
                { isCropped && croppedImageUrl && (
                    <img src={croppedImageUrl} style={{borderRadius:'50%'}} width="180px" height="180px" alt=""/>
                )}
                <div style={{marginBottom:'10px'}}>
                    <label htmlFor="contained-button-file">
                        <Input accept="image/*" id="contained-button-file" type="file" onChange={this.onSelectedFile}/>
                        <Button variant="contained" component="span">
                            Upload
                        </Button>
                    </label>
                    {src && (
                    <Button variant="contained" component="span" style={{margin:'0px 5px', paddingLeft:'26px', paddingRight:'26px'}} onClick={this.onCropImage}>
                        Save
                    </Button>
                    )}                    
                </div>
            </div>
        );
    }
}