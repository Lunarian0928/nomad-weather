import { StatusBar } from 'expo-status-bar';
import * as Location from 'expo-location';
import { useState, useEffect } from 'react';
import { 
  StyleSheet, // 스타일시트
  Text, // <p>
  Dimensions, 
  View, // <div>
  ScrollView, // 스크롤 가능한 <div>
  ActivityIndicator, // 로딩 애니메이션
} from 'react-native';
import { Fontisto } from '@expo/vector-icons';


const { width: SCREEN_WIDTH } = Dimensions.get("window"); // 화면의 너비를 미리 계산
const API_KEY = "3137cab544d41940bdd04f4e1059966c"; // openweather API키
const icons = {
  "Clouds": "cloudy"
}
export default function App() {
  const [city, setCity] = useState("Loading..."); // 도시명
  const [days, setDays] = useState([]); // 날짜별 날씨 정보
  const [ok, setOk] = useState(true); // 위치 권한 허용 여부

  const getWeather = async () => {
    const {granted}= await Location.requestForegroundPermissionsAsync(); // 위치 수집 권한 수락하도록 하는 함수
    if (!granted) { // 사용자가 허용하였다면
      setOk(false);
    }
    const currentPosition = await Location.getCurrentPositionAsync({ accuracy: 5 }); // 좌표 얻어오기
    const { latitude, longitude } = currentPosition.coords; //  위도와 경도만 가져오기
    const location = await Location.reverseGeocodeAsync({ latitude, longitude }, { useGoogleMaps: false }); // 위도와 경도를 통해 주소명 알아내기
    setCity(location[0].city); // 주소명에서 도시명 추출
    
    // openweather에 위도와 경도를 전달하여 날씨를 받아옴
    // 무료로 제공하는 api는 3시간 간격으로 날씨를 제공하므로 가공이 필요
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&lang=kr`);
    
    // response를 받아오면 json을 추출함
    const json = await response.json();

    // 하루 간격으로 날씨 정보가 필요함
    // 따라서 00:00:00을 기준으로 해서 날짜 정보를 필터링함.
    setDays(
      json.list.filter((element) => {
        if (element.dt_txt.includes("00:00:00")) {
          return element;
        }
      })
    );
  };

  // 처음 마운트되었을 때 도시, 날씨 정보를 얻어옴
  useEffect(() => {
    getWeather();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.city}>
        <Text style={styles.cityName}>{city}</Text>
      </View>
      <ScrollView 
        pagingEnabled // 스크롤이 페이지를 넘기는 것처럼 설정됨
        horizontal  // 방향을 수평으로 (기본은 수직임)
        showsHorizontalScrollIndicator={false} // 스크롤 인디케이터가 보이지 않도록 설정
        contentContainerStyle={styles.weather}
      >
        {days.length === 0 ? ( // 날씨 정보를 아직 받아오지 않았다면
            // 로딩 애니메이션
            <View style={styles.day}>  
              <ActivityIndicator color="white" size="large" style={{marginTop: 10}}/> 
            </View>
          ) : ( // 날씨 정보를 받아왔다면
            // 날씨 정보
            days.map((day, index) => 
              <View key={index} style={styles.day}>
                <View>
                  <Text style={styles.temp}>
                    {parseFloat(day.main.temp).toFixed(1)}
                  </Text> 
                  <Text></Text>
                </View>
                <View>
                  <Text style={styles.description}>{day.weather[0].main}</Text>
                  <Text style={styles.tinyText}>{day.weather[0].description}</Text>
                </View>
              </View>
            )
          )
        }
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // 기본 뷰 
  container: { 
    flex: 1, 
    backgroundColor: 'tomato',
  },

  // 도시명
  city: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cityName: {
    fontSize: 68,
    fontWeight: "500",
  },
  
  // 날짜 정보
  day: {
    width: SCREEN_WIDTH,
    alignItems: "center",
  },
  // 온도
  temp: {
    marginTop: 50,
    fontSize: 178,
  },
  // 간단 설명
  description: {
    marginTop: -30,
    fontSize: 60,
  },
  // 상세 설명
  tinyText: {
    fontSize: 20,
  }
})