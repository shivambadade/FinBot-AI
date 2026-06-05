import pandas as pd

import pickle

import nltk



from nltk.corpus import stopwords

from nltk.tokenize import word_tokenize

from nltk.stem import PorterStemmer



from sklearn.feature_extraction.text import TfidfVectorizer

from sklearn.linear_model import LogisticRegression





nltk.download('punkt')

nltk.download('stopwords')





# LOAD DATASET

data = pd.read_csv("ml/intents_dataset.csv")





# NLP PREPROCESSING

stemmer = PorterStemmer()

stop_words = set(stopwords.words("english"))





def preprocess_text(text):

    text = text.lower()

    words = word_tokenize(text)



    filtered_words = []



    for word in words:

        if word.isalnum() and word not in stop_words:

            stemmed_word = stemmer.stem(word)

            filtered_words.append(stemmed_word)



    return " ".join(filtered_words)





# APPLY PREPROCESSING

data["processed_text"] = data["text"].apply(preprocess_text)





# CONVERT TEXT → NUMBERS

vectorizer = TfidfVectorizer()

X = vectorizer.fit_transform(data["processed_text"])





# TARGET LABELS

y = data["intent"]





# TRAIN MODEL

model = LogisticRegression()

model.fit(X, y)





# SAVE MODEL

with open("ml/intent_model.pkl", "wb") as model_file:

    pickle.dump(model, model_file)





# SAVE VECTORIZER

with open("ml/vectorizer.pkl", "wb") as vectorizer_file:

    pickle.dump(vectorizer, vectorizer_file)





print("Intent Detection Model Trained Successfully!")