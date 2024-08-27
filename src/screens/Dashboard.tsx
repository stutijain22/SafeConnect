import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button, Image, TouchableOpacity, View } from 'react-native';
import ViewShot from 'react-native-view-shot';
import WebView from 'react-native-webview';
import Share from 'react-native-share';
import { deviceHeight, deviceWidth } from '../styling/mixin';
import DeviceInfo from 'react-native-device-info';
import { getData } from '../pushnotification_helper';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { CROSS_BLACK } from '../sharedImages';
import { RNCamera } from 'react-native-camera';


const Dashboard = () => {
    const [redirectUrl, setRedirectUrl] = useState<any>('https://safeconnects.in/crm/sc-app/');
    const [source, setSource] = useState(null);
    const [loading, setLoading] = useState(false);
    let viewShotRef = useRef<any>()
    const webviewRef = useRef<any>(null)
    const [deviceUniqueId, setDeviceUniqueId] = useState<any>('');
    const [deviceFcmToken, setDeviceFcmToken] = useState<any>('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const qrScannerRef: any = useRef(null);

    // let webviewRef = useRef<any>()
    useEffect(() => {
        (async () => {
            await DeviceInfo.getUniqueId().then((uniqueId) => {
                setDeviceUniqueId(uniqueId)
            });

            let FcmToken = await getData('fcmToken');
            await setDeviceFcmToken(FcmToken)
            // setTimeout(() => { resetScreen(navigation, S_Dashboard) }, 3000)
        })();
    }, []);
    
    const onCapture = useCallback((uri: any) => setSource({ uri }), []);

    const takeScreenshot = (data:any) => {
        viewShotRef.current.capture().then(
            async (uri:any) => {
                console.log(uri)
                await shareScreenshot(uri,data)
            }
        )
    }

    const shareScreenshot = async (uri: any,dataText:any) => {        
        try {
            await Share.open({
                url: uri,
                message: dataText
            });
        } catch (error) {
            console.error('Error sharing screenshot:', error);
            //   Alert.alert('Error', 'Failed to share screenshot');
        }
    };

    const onNavigationStateChange = async (webViewState: any) => {
        console.log("dataaaaaaaaaaaaaaaaaaaaaa", webViewState);
        // if (webViewState?.url?.includes("?detail=")) {
        //     webViewRef.current.stopLoading();
        //     console.log("222222222222222222", webViewRef.current);

        //     // if (webViewRef.current) {
        //     //     console.log('sssssssssssssssss');

        //     //     webViewRef.current.stopLoading();
        //     // }
        //     console.log("11111111111111", webViewState);
        //     let data = webViewState?.url?.split("?detail=");
        //     // let data1 = `https://carecargoforwarders.com/crm/customer/AdminController/api_device_info?method=post&customer_id=${data[1]}&device_unique_id=${deviceUniqueId}&device_token=${deviceFcmToken}&type=${data[0]}`
        //     console.log("333333333333333333", data[1]);
        //     await setTextSend(data[1])
        //     await takeScreenshot()
        //     // await setPreviousUrl(webViewState?.url)
        //     // await setRedirectUrl(data1);
        // }
    }

    const onSuccess = async (e: any) => {
        await setIsModalVisible(false)
        await setRedirectUrl(e?.data)
    }

    const onShouldStartLoadWithRequest=(event:any) =>{
       if(event?.url?.includes("/api-device-info/")){
        let data = event?.url?.split("/").reverse();        
        fetch(event?.url,
        {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify({
                device_unique_id: deviceUniqueId,
                device_token:deviceFcmToken,
                customer_id:data[0]
               })
        })
        .then(async(res)=> { 
            if(res.status == 200){
                console.log("resssssssssssssss", JSON.stringify(res?.status)) }
                await setRedirectUrl(res?.url)
            }
           )
        .catch(function(res){ console.log(res) })
       }
       else if(event?.url?.includes("/api-device-info-gru/")){
        let data = event?.url?.split("/").reverse();        
        fetch(event?.url,
        {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify({
                device_unique_id: deviceUniqueId,
                device_token:deviceFcmToken,
                gru_id:data[0]
               })
        })
        .then(async(res)=> { 
            if(res.status == 200){
                console.log("resssssssssssssss", JSON.stringify(res?.status)) }
                await setRedirectUrl(res?.url)
            }
           )
        .catch(function(res){ console.log(res) })
       }
       else if(event?.url?.includes("?detail=")){
            (async () => {
                console.log("11111111111111", event);
                let data = event?.url?.split("?detail=");
                // let data1 = `https://carecargoforwarders.com/crm/customer/AdminController/api_device_info?method=post&customer_id=${data[1]}&device_unique_id=${deviceUniqueId}&device_token=${deviceFcmToken}&type=${data[0]}`
                const data1 = data[1].replace('%20',' ')
                console.log("333333333333333333", data1);
    
                // await setTextSend(data1)
                 await takeScreenshot(data1)
            })();
            return false;
        } 
        else if (event?.url?.includes("open-camera-for-scan")) {
            (async () => {
            // await setRedirectUrl(data1);
            await setIsModalVisible(true);
        })();
        return false;
            // await requestCameraPermission()
        }else{
            (async () => {
            await setRedirectUrl(event?.url);
        })();
        return false;
        }
        return true;
    }


    return (
        <View style={{ flex: 1, display: 'flex' }}>
            {/* <Button onPress={takeScreenshot} title="Take Screenshot"/> */}
            {isModalVisible && <TouchableOpacity
                onPress={() => {
                    setIsModalVisible(false)
                    setRedirectUrl(redirectUrl)
                }
                }
                style={{
                    alignItems: "flex-end", marginTop: 20, marginRight: 10,
                    alignSelf: 'flex-end', justifyContent: "center",
                    width: 25, height: 25,
                }}>
                <Image resizeMode={'contain'}
                    tintColor={'#000000'}
                    source={CROSS_BLACK}
                    height={20} width={20}
                />
            </TouchableOpacity>}
            {!isModalVisible ?
            <ViewShot
                ref={viewShotRef}
                onCapture={onCapture}
                style={{width:deviceWidth, height:deviceHeight}}
            >
                <WebView
                    ref={webviewRef}
                    source={{ uri: redirectUrl }}
                    onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
                    onNavigationStateChange={(webViewState) => onNavigationStateChange(webViewState)}
                    javaScriptEnabled
                    bounces={false}
//                     onLoad={(url:any) =>{
// console.log("urlrrrrrrrrrrrrrrrrrrrrrrr",url);

//                     }}
                />
            </ViewShot>:
              <View style={{
                flex: 1,
                justifyContent: 'center', alignItems: 'center'
            }}>
                <QRCodeScanner
                    ref={qrScannerRef}
                    onRead={onSuccess}
                    fadeIn
                    showMarker
                    reactivate
                    // cameraTimeout={3000}
                    // containerStyle={{}}
                    // topViewStyle={{ backgroundColor: 'black' }}
                    // containerStyle={{ justifyContent: 'center', alignItems: 'center' }}
                    // cameraContainerStyle={{ backgroundColor: 'pink', }}
                    // cameraStyle={{ backgroundColor: 'yellow' }}
                    // cameraType=''
                    flashMode={RNCamera.Constants.FlashMode.auto}
                // checkAndroid6Permissions
                // permissionDialogMessage=''
                // topContent={
                //     <TouchableOpacity /* onPress={() => setRedirectUrl(qrScannerLink)} */>
                //         <TextComponent fontSize={20} color='black' value={qrScannerLink} />
                //     </TouchableOpacity>
                // }
                // bottomContent={
                //     <TouchableOpacity onPress={(e) => navigateScreen(navigation, S_Dashboard)}>
                //         <TextComponent fontSize={25} color='black' value={'EXIT'} />
                //     </TouchableOpacity>
                // }
                />
            </View>
        }
        </View>
    );
};

export default Dashboard;