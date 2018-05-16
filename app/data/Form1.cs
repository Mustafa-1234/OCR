/*using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace CsvToJson
{
    public partial class Form1 : Form
    {
        public Form1()
        {
            InitializeComponent();
        }

        private void button1_Click(object sender, EventArgs e)
        {
            try
            {
                using (StreamWriter writetext = new StreamWriter("E:\\Master\\WS2016\\Thesis\\Frontend\\data\\json.txt"))
                {

                    writetext.WriteLine("{\n\"Node\":\n [");
                    string[] groundTruth=new string[10];
                var lines = File.ReadAllLines("E:\\Master\\WS2016\\Thesis\\Frontend\\data\\temp.txt");
                int counter = 0;
                foreach (string  line in lines)
                {
                    line.Replace(" ",string.Empty);

                    line.Replace("\t", string.Empty);
                    if (counter==0)
                    {
                        groundTruth =line.Split(',');
                    }
                    else
                    {
                        string[] tempArray= line.Split(',');
                        int counter_row=0;
                        foreach(string s in tempArray)
                        {
                                if(groundTruth[counter_row]=="")
                                {
                                    continue;
                                }
                            string tempJson= " \n\t{\n\t\t\"Ground_truth\":\"" + groundTruth[counter_row]+"\""
                                + ",\n\t\t\"Prediction\":\"" + tempArray[counter_row] + "\""
                                + ",\n\t\t\"epoch\":\"" + counter+ "\""
                                + "\n\t},";

                         //   Console.WriteLine(tempJson);
                            writetext.WriteLine(tempJson);
                            counter_row++;
                        }
                      
                    }
                    counter++;
              //      Console.WriteLine(line);
                }

                    writetext.WriteLine("\n]\n}");

                }


            }
            catch (Exception ex)
            {

            }
        }
    }
}
*/