import React, {useState} from 'react';
import {View, Text, Dimensions, StyleSheet} from 'react-native'
import MapView, { Callout, Marker, ProviderPropType } from 'react-native-maps';

const { width, height } = Dimensions.get('window');

const ASPECT_RATIO = width / height;
const LATITUDE = 37.78825;
const LONGITUDE = -122.4324;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

export default function PoiClick() {
    const [poi, setPoi] = useState(null);

    const onPoiClick = (e) => {
        const poi = e.nativeEvent;
    
        console.log(poi);
        setPoi(poi);
    }

    return (
        <MapView 
            style={{flex: 1}}
            provider={"google"}
            initialRegion={{
                latitude: 37.53196,
                longitude: 126.64896,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
            }}
            // mapType={"standard"}
            showsUserLocation={true}
            showsTraffic={true}
            zoomControlEnabled={false}
            zoomEnabled={true}
            // zoomTapEnabled={true}
            showsBuildings={true}
            // minZoomLevel={1}
            // maxZoomLevel={19}
            showsIndoorLevelPicker={true}
            showsCompass={true}
            onPoiClick={onPoiClick}
            >
                {poi && (
                        <Marker coordinate={poi.coordinate}>
                        <Callout>
                            <View>
                            <Text>Place Id: {poi.placeId}</Text>
                            <Text>Name: {poi.name}</Text>
                            </View>
                        </Callout>
                        </Marker>
                )}
        </MapView>    
    )
}

