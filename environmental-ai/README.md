same idea as the finance tracker versions. the page looks the same the whole way. each folder just turns on one more piece.

version 1 is the home page and generate design only returns the tinkercad link and a canned line.
version 2 adds login, signup, and logout. the account sits in the browser.
version 3 picks a city off the old state list.
version 4 asks open-meteo for the temperature, the rain, and the wind. i used a fixed pin per state here because nominatim was not in yet.
version 5 swaps that pin for a nominatim search so the state name is a real lat and lon.
version 6 adds overpass. parks and woods are counted inside 1.8 km. buildings are counted inside 650 m. the wider building ring was timing out, so i pulled it in after the first georgia test sat there.
version 7 is the csv and site_knn.py. it trains a scikit-learn knn on sites.csv and just prints that it is up. the page does not call it yet.
version 8 posts the weather and the map counts into that model and writes the label into the boxes that were already on the page.
version 9 puts the help chat back, still the scripted one.
version 10 points help at the language model. the dev server proxies /api/chat the same way the finance tracker proxied its help call. the last generate-design reading is saved in the browser so the reply can use those numbers.

rain in sites.csv is daily mm, not a yearly total. the first pass used yearly numbers and every site came back as storm once open-meteo returned something like 2 mm. k is 4. k=3 kept flipping the warm low-rain rows between shade and heat.

searching the state name on nominatim returned the middle of the state, and overpass then counted zero parks. the query now sends a city name in that state and nominatim still supplies the lat and lon.

temperature is stacked twice in the knn vector. a 17 c georgia reading was coming back as heat because the empty park count looked like the heat rows and the scaler was letting that beat a 20 degree gap.

to run version 10, from the e-ai folder:

python site_knn.py

then in another terminal, npm start

open http://localhost:4200/

versions 8 through 10 need the python process or the label stays unknown. versions 4 through 10 need npm start so the proxy is there. open-meteo, nominatim, and overpass do not need a key.
