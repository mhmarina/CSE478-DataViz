from selenium import webdriver
from selenium.webdriver import Chrome
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from bs4 import BeautifulSoup
from more_itertools import unique_everseen
from selenium.common.exceptions import TimeoutException
import time

driver = Chrome()
driver.get('https://www.kasselerliste.com/die-kasseler-liste/')
#show num entries drop down
wait = WebDriverWait(driver, 20);
wait.until(EC.visibility_of_element_located((By.ID, "table_1_next")));
driver.find_element(By.CLASS_NAME, "wdtheader.sort.column-name.sorting_asc").click()

def findAndClick():
    try:
        if(driver.find_element(By.CLASS_NAME, "paginate_button.current").accessible_name == '2432'):
            return False
        else:
            print(driver.find_element(By.CLASS_NAME, "paginate_button.current").accessible_name)
        nextBtn = wait.until(EC.visibility_of_element_located((By.ID, "table_1_next")))
        nextBtn.click()
        time.sleep(2)
    except (TimeoutException) as e:
        print(e)
        return False
    return True

headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.12; rv:55.0) Gecko/20100101 Firefox/55.0',
}

with open("data.csv", "a", encoding='utf-8') as file:
    file.truncate(0)
    while(True):
        soup = BeautifulSoup(driver.page_source, "html.parser")
        rows = soup.findAll("tr")
        for j in range(1, len(rows)):
            for i in range(len(rows[j].contents)):

                string = ""

                if(i == 0):
                    string = str(rows[j].contents[i].get_text()).replace(",", " ")
                    string = "None" if len(string) == 0 else string
                else:
                    string = str(rows[j].contents[i].string).replace(",", " ")
        
                if(i == len(rows[j].contents) - 1):
                    file.write(f'{string}')
                else:
                    file.write(f'{string},')
            file.write('\n')
        found = findAndClick()
        if(not found):
            break

# clean up duplicates etc:
with open('data.csv', 'r', encoding='utf-8') as f, open('uniqueData.csv', 'w', encoding='utf-8') as file:
    file.writelines(unique_everseen(f))
driver.quit()