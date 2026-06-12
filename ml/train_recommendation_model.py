import pandas as pd

import pickle



from sklearn.ensemble import RandomForestClassifier

from sklearn.preprocessing import LabelEncoder





# LOAD DATASET

data = pd.read_csv("ml/recommendation_dataset.csv")





# ENCODE TEXT COLUMNS

type_encoder = LabelEncoder()

recommendation_encoder = LabelEncoder()



data["type_encoded"] = type_encoder.fit_transform(data["type"])

data["recommendation_encoded"] = recommendation_encoder.fit_transform(

    data["recommendation"]

)





# INPUT FEATURES

X = data[["amount", "years", "type_encoded"]]





# TARGET OUTPUT

y = data["recommendation_encoded"]





# TRAIN MODEL

model = RandomForestClassifier(

    n_estimators=100,

    random_state=42

)

model.fit(X, y)





# SAVE MODEL

with open("ml/recommendation_model.pkl", "wb") as model_file:

    pickle.dump(model, model_file)





# SAVE ENCODERS

with open("ml/type_encoder.pkl", "wb") as type_file:

    pickle.dump(type_encoder, type_file)



with open(

    "ml/recommendation_encoder.pkl",

    "wb"

) as recommendation_file:

    pickle.dump(

        recommendation_encoder,

        recommendation_file

    )





print(

    "ML Recommendation Model Trained Successfully!"

)