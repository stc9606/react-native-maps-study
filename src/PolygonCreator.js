import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Alert
} from 'react-native';

import MapView, {
  MAP_TYPES,
  Polygon,
  Polyline,
  Circle,
  ProviderPropType,
  AnimatedRegion,
  Marker
} from 'react-native-maps';
import axios from 'axios';
import { isPointInPolygon, getDistance, getPreciseDistance } from 'geolib';

const { width, height } = Dimensions.get('window');

const ASPECT_RATIO = width / height;
const LATITUDE = 37.53196;
const LONGITUDE = 126.64896;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
let id = 0;

export default function PolygonCreator() {
    const [region, setRegion] = useState({
        latitude: LATITUDE,
        longitude: LONGITUDE,
        latitudeDelta : LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA
    });
    
    const [polygons, setPolygons] = useState([]);
    const [editing, setEditing] = useState(null);    
    const [creatingHole, setCreatingHole] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [mapViewControl, setMapViewControl] = useState(false);

    const mapOptions = {
        scrollEnabled : true
    }

    /* 영역 생성 모드 나가기 함수. */
    const finish = () => {
        if(editing) {
            setPolygons([...polygons, editing]);
            setEditing(null);
            setCreatingHole(false);            
        }
        setEditMode(false);        
    }

    /* 그린 영역을 저장 */
    const createHole = () => {
        if(!creatingHole) {
            setCreatingHole(true);
            
            setEditing({
                ...editing,
                holes: [...editing.holes, []],
            });

        } else {
            const holes = [...editing.holes];            

            if(holes[holes.length - 1].length === 0) {
                holes.pop();
                setEditing({
                    ...editing,
                    holes,
                })
            }
            setCreatingHole(false);
        }
    }

    /* 영역을 그려주는 함수. */
    const onPress = (e) => {
        if(!editing) {
            console.log('처음 점 찍기')
            setEditing({
                id: id++,
                coordinates: [e.nativeEvent.coordinate],
                holes: [],
            })
        }
        else if(!creatingHole) {            
            console.log('영역 점 찍기')
            setEditing({
                ...editing,
                coordinates: [...editing.coordinates, e.nativeEvent.coordinate]
            })
        }
        // else {
        //     console.log('홀 1개 이상일때')
        //     const holes = [...editing.holes];
            
        //     holes[holes.length - 1] = [
        //         ...holes[holes.length - 1],
        //         e.nativeEvent.coordinate
        //     ];

        //     console.log('holes', holes);

        //     setEditing({
        //         ...editing,
        //         id: id++,
        //         coordinates: [...editing.coordinates],
        //         holes: holes
        //     })
        // }
    }
    
    /* 영역 생성 클릭 */
    const initCreate = async (e) => { 
        setEditMode(true);            
        
        // await axios.get(`https://naveropenapi.apigw.ntruss.com/map-reversegeocode/v2/gc?coords=${LONGITUDE},${LATITUDE}&orders=roadaddr&output=json`, {
        //     headers: {                
        //         "X-NCP-APIGW-API-KEY-ID": '5md90yszqj',
        //         "X-NCP-APIGW-API-KEY" : 'uCJci6Ixm4DN7hUGtSrjKh6NU6z0SOKq9idpkLat'
        //     }
        // }).then((rs) => {
        //     console.log('주소 ?  :', rs)
        // }).catch((err) => {
        //     console.log('eeror ', err);
        // })

        
    }

    /* 영역안에 해당 사람이 포함되어 있는지 확인하는 함수 */
    const onCheck = () => {        
        if(!polygons) {
            Alert.alert('영역을 생성하세유~');
        }
        else {
            const checkPosit = isPointInPolygon(region ,polygons[0].coordinates);

            if(checkPosit) {
                Alert.alert("In");

                /* 거리 계산 */
                console.log(getDistance(
                    { latitude: LATITUDE, longitude: LONGITUDE },
                    { latitude: 37.51970, longitude: 126.61077 }
                ))

            } else {
                Alert.alert("Out");
            } 
        }               
    }

    /* Test를 위한 위치 이동 함수. */
    const onRefresh = () => {       
        const newCoordinate = {
            latitude: 37.53196 + (Math.random() - 0.5) * (LATITUDE_DELTA / 2),
            longitude: 126.64896 + (Math.random() - 0.5) * (LONGITUDE_DELTA / 2),
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA
        }
        setRegion(newCoordinate);

        // const checkPosit = isPointInPolygon(newCoordinate ,editing.coordinates);
         
        // if(checkPosit) {
        //     Alert.alert('IN');
        // }
    }

    if(editing) {
        mapOptions.scrollEnabled = false;
        mapOptions.onPanDrag = e => onPress(e);       
    }    
    
    return (
        <View style={style.container}>
            <MapView
                provider={"google"}
                style={style.map}
                mapType={mapViewControl ? 'satellite' : 'standard'}
                initialRegion={region}
                onPress={e => onPress(e)}                
                {...mapOptions}
            >                
                {polygons.map(polygon => (
                    <Polygon 
                        key={polygon.id}
                        holes={polygon.holes}
                        coordinates={polygon.coordinates}
                        strokeWidth={1}
                        strokeColor="rgba(100, 150, 255, 0.4)"
                        fillColor="rgba(100, 150, 255, 0.4)"
                    />
                ))}
                {editing && (
                    <Polygon 
                        key={editing.id}
                        coordinates={editing.coordinates}
                        holes={editing.holes}
                        strokeWidth={1}
                        strokeColor="rgba(100, 150, 255, 0.4)"
                        fillColor="rgba(100, 150, 255, 0.4)"
                    />
                )}  
                <Polyline
                    coordinates={[
                        {latitude: 37.53296, longitude: 126.65896,},
                        {latitude: region.latitude, longitude: region.longitude}
                    ]}
                    strokeColor="#F00"
                    fillColor="rgba(255,0,0,1)"
                    strokeWidth={5}
                />
                <Polyline
                
                />
                <Marker 
                    coordinate={region}
                /> 
                <Marker 
                    coordinate={{
                        latitude: 37.53296,
                        longitude: 126.65896,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0922 * ASPECT_RATIO
                    }}
                />          
            </MapView>
            <View style={style.mapViewContainer}>
                <TouchableOpacity
                    onPress={() => setMapViewControl(prevState => !prevState)}
                    style={[style.bubble, style.button]}
                >
                    <Text>
                        위성
                    </Text>
                </TouchableOpacity>
            </View>
            <View style={style.buttonContainer}>
                {editMode && (
                    <TouchableOpacity
                        onPress={() => createHole()}
                        style={[style.bubble, style.button]}
                    >
                        <Text>
                            {creatingHole ? '수정' : '저장'}
                        </Text>
                    </TouchableOpacity>
                )}
                {editMode && (
                    <TouchableOpacity 
                        onPress={() => finish()}
                        style={[style.bubble, style.button]}
                    >
                        <Text>나가기</Text>
                    </TouchableOpacity>
                )}
                
                
            </View>
            <View style={style.buttonContainer}>
                {!editMode &&
                    <>
                        <TouchableOpacity 
                            onPress={() => onCheck()}
                            style={[style.bubble, style.button]}
                        >
                            <Text>검사</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            onPress={() => onRefresh()}
                            style={[style.bubble, style.button]}
                        >
                            <Text>이동</Text>
                        </TouchableOpacity>
                    </>
                }
                <TouchableOpacity 
                    onPress={(e) => initCreate(e)}
                    style={[style.bubble, style.button]}
                >
                    <Text>영역 생성</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const style = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    bubble: {
        backgroundColor: 'rgba(255,255,255,0.7)',
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 20,
    },
    latlng: {
        width: 200,
        alignItems: 'stretch',
    },
    button: {
        width: 80,
        paddingHorizontal: 12,
        alignItems: 'center',
        marginHorizontal: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        marginVertical: 20,
        backgroundColor: 'transparent',
    },
    mapViewContainer: {
        marginVertical: 20,
        backgroundColor: 'transparent',
    }
})