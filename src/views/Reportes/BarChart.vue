<template>
  <div class="card" v-if="mostrar">
    <div class="f">
      <p>
        En este apartado podrás visualizar el reporte de cuantos vehículos se
        han atendido en el autolavado a lo largo del año
      </p>
      <button class="btn button btn-primary espacio-izq" @click="cargarDatos()">
        Cargar gráfico
      </button>
    </div>
  </div>
  <Bar id="BarChart" :options="chartOptions" :data="chartData" />
</template>

<script>
import { Bar } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import { Chart } from "chart.js";
import { Colors } from "chart.js";

//importar firebase
import "firebase/compat/auth";
import "firebase/compat/firestore";
import db from "../../firebase/init.js";

Chart.register(Colors);

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

export default {
  name: "BarChart",
  components: { Bar },
  data() {
    return {
      mostrar: true,
      years: [],
      query: null,
      find: true,
      count: 0,
      valorMaximo: 0,

      //información para el grafico
      chartData: {
        labels: [
          "Enero",
          "Febrero",
          "Marzo",
          "Abril",
          "Mayo",
          "Junio",
          "Julio",
          "Agosto",
          "Septiembre",
          "Octubre",
          "Noviembre",
          "Diciembre",
        ],
        datasets: [
          {
            label: "Vehículos atendidos",
            data: [],
            borderWidth: 2,
            borderRadius: 10,
          },
        ],
      },
    };
  },

  methods: {
    //funcion para obtener los datos desde Firestore
    async getData() {
      var meses = [];
      let max = 0;

      //ciclo que pasa por los 12 meses del año
      for (let i = 1; i <= 12; i++) {
        await obtenerCantidadVehiculos(i);
      }

      // función que obtiene la cantidad de vehículos desde la colección "meses"
      async function obtenerCantidadVehiculos(indice) {
        try {
          const docRef = db.collection("Meses").doc(String(indice));
          const doc = await docRef.get();

          if (doc.exists) {
            const data = doc.data();
            const cantidadVehiculos = data.vehiculos + 0.1;
            meses[indice] = cantidadVehiculos;

            // Actualiza el valor máximo si es necesario
            if (cantidadVehiculos > max) {
              max = cantidadVehiculos;
            }
          } else {
            meses[indice] = 0.1;
          }
        } catch (error) {
          console.error("Error al obtener vehículos por mes:", error);
        }
      }

      //almacena la informacion reacabada en el arreglo
      const data = {
        value1: meses[1],
        value2: meses[2],
        value3: meses[3],
        value4: meses[4],
        value5: meses[5],
        value6: meses[6],
        value7: meses[7],
        value8: meses[8],
        value9: meses[9],
        value10: meses[10],
        value11: meses[11],
        value12: meses[12],
      };

      //guarda el valor máximo en una variable global
      this.valorMaximo = max;
      return data;
    },

    //funcion para cargar los datos al grafico
    cargarDatos() {
      this.mostrar = false;

      //obtiene los datos de la función anterior
      this.getData().then((data) => {
        this.chartData.datasets[0].data =
          this.chartData.datasets[0].data.concat(data.value1);
        this.chartData.datasets[0].data =
          this.chartData.datasets[0].data.concat(data.value2);
        this.chartData.datasets[0].data =
          this.chartData.datasets[0].data.concat(data.value3);
        this.chartData.datasets[0].data =
          this.chartData.datasets[0].data.concat(data.value4);
        this.chartData.datasets[0].data =
          this.chartData.datasets[0].data.concat(data.value5);
        this.chartData.datasets[0].data =
          this.chartData.datasets[0].data.concat(data.value6);
        this.chartData.datasets[0].data =
          this.chartData.datasets[0].data.concat(data.value7);
        this.chartData.datasets[0].data =
          this.chartData.datasets[0].data.concat(data.value8);
        this.chartData.datasets[0].data =
          this.chartData.datasets[0].data.concat(data.value9);
        this.chartData.datasets[0].data =
          this.chartData.datasets[0].data.concat(data.value10);
        this.chartData.datasets[0].data =
          this.chartData.datasets[0].data.concat(data.value11);
        this.chartData.datasets[0].data =
          this.chartData.datasets[0].data.concat(data.value12);

        //variables para desplegar el grafico
        const canvas = document.getElementById("BarChart");
        const chartInstance = Chart.getChart(canvas);
        const ctx = canvas.getContext("2d");
        let delayed;

        //si existe otra instancia del grafico la elimina
        if (chartInstance) {
          chartInstance.destroy();
        }

        //creacion del grafico
        const chart = new Chart(ctx, {
          type: "bar",
          data: this.chartData,
          options: this.chartOptions,
          options: {
            animation: {
              onComplete: () => {
                delayed: true;
              },
              delay: (context) => {
                let delay = 0;
                if (
                  context.type === "data" &&
                  context.mode === "default" &&
                  !delayed
                ) {
                  delay = context.dataIndex * 300 + context.datasetIndex * 100;
                }
                return delay;
              },
            },
            elements: {
              bar: {
                backgroundColor: this.colorize(),
                borderColor: "#000000",
              },
            },
            plugins: {
              legend: false,
              title: {
                display: true,
                text: "Vehículos atendidos",
              },
            },
          },
        });
      });
    },

    //funcion para darle color a las barras segun el valor máximo
    colorize() {
      return (ctx) => {
        const value = ctx.parsed.y;
        const color =
          value < this.valorMaximo / 4
            ? "#D60000"
            : value < this.valorMaximo / 2
            ? "#F46300"
            : value < this.valorMaximo
            ? "#FFFF00"
            : "#44DE28";
        return color;
      };
    },
  },
};
</script>
