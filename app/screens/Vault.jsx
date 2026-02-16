import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";


export default function DocumentVault() {
  return (
    <SafeAreaView className="flex-1 bg-[#f6f6f8]">
      {/* Header */}
      <View className="bg-[#f6f6f8]/90 backdrop-blur-md border-b border-slate-200">
        <View className="flex-row items-center justify-between px-4 py-3">
          <View className="flex-row items-center gap-3 my-2 px-2">
            <View className="h-9 w-9 rounded-lg bg-[#1152d4]/10 items-center justify-center">
              <MaterialIcons name="lock" size={20} color="#1152d4" />
            </View>
            <View>
              <Text className="text-lg font-bold text-slate-900">
                Document Vault
              </Text>
              <View className="flex-row items-center gap-1">
                <MaterialIcons name="verified" size={12} color="#16a34a" />
                <Text className="text-[10px] font-bold uppercase text-slate-500">
                  Secure Storage
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity className="h-10 w-10 rounded-full bg-white border border-slate-200 items-center justify-center">
            <MaterialIcons name="search" size={20} color="#334155" />
          </TouchableOpacity>
        </View>

        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-4 pb-3"
        >
          <View className="flex-row gap-2">
            <FilterChip active label="All Files" />
            <FilterChip label="Personal IDs" />
            <FilterChip label="Property" />
            <FilterChip label="Court Papers" />
          </View>
        </ScrollView>
      </View>

      <ScrollView className="px-4">
        {/* Recently Added */}
        <SectionHeader title="Recently Added" action="View History" />

        <FileItem
          icon="picture-as-pdf"
          color="red"
          title="Aadhar_Card.pdf"
          subtitle="Personal ID • 2h ago"
        />

        {/* Personal IDs */}
        <CategorySection
          icon="badge"
          color="#3b82f6"
          title="Personal IDs"
          files={[
            { title: "PAN_Card.jpg", subtitle: "Aug 12, 2023 • 850 KB", icon: "contact-page", color: "blue" },
            { title: "Voter_ID.pdf", subtitle: "May 04, 2023 • 1.1 MB", icon: "picture-as-pdf", color: "red" },
          ]}
        />

        {/* Property Docs */}
        <CategorySection
          icon="holiday-village"
          color="#f97316"
          title="Property Docs"
          files={[
            { title: "House_Deed.pdf", subtitle: "Jan 15, 2024 • 4.5 MB", icon: "description", color: "orange" },
          ]}
        />

        {/* Court Papers */}
        <CategorySection
          icon="gavel"
          color="#9333ea"
          title="Court Papers"
          files={[
            { title: "Summons_Oct23.pdf", subtitle: "Oct 12, 2023 • 2.3 MB", icon: "balance", color: "purple" },
          ]}
        />

        <View className="h-32" />
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity className="absolute bottom-24 right-6 h-14 w-14 rounded-full bg-[#1152d4] items-center justify-center shadow-lg">
        <MaterialIcons name="add" size={28} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function FilterChip({ label, active }) {
  return (
    <View
      className={`px-4 py-1.5 rounded-full ${
        active
          ? "bg-[#1152d4]"
          : "bg-white border border-slate-200"
      }`}
    >
      <Text
        className={`text-sm font-semibold ${
          active ? "text-white" : "text-slate-600"
        }`}
      >
        {label}
      </Text>
    </View>
  );
}

function SectionHeader({ title, action }) {
  return (
    <View className="flex-row items-center justify-between mt-6 mb-3">
      <Text className="text-sm font-bold uppercase tracking-wider text-slate-900">
        {title}
      </Text>
      {action && (
        <Text className="text-xs font-semibold text-[#1152d4]">
          {action}
        </Text>
      )}
    </View>
  );
}

function FileItem({ icon, color, title, subtitle }) {
  const colorMap = {
    red: "bg-red-100 text-red-600",
    blue: "bg-blue-100 text-blue-600",
    orange: "bg-orange-100 text-orange-600",
    purple: "bg-purple-100 text-purple-600",
  };

  return (
    <View className="flex-row items-center justify-between p-3 bg-white border border-slate-200 rounded-xl mb-2">
      <View className="flex-row items-center gap-3">
        <View
          className={`h-10 w-10 rounded-lg items-center justify-center ${colorMap[color]}`}
        >
          <MaterialIcons name={icon} size={20} />
        </View>
        <View>
          <Text className="text-sm font-bold text-slate-900">
            {title}
          </Text>
          <Text className="text-[11px] text-slate-500">
            {subtitle}
          </Text>
        </View>
      </View>

      <MaterialIcons name="more-vert" size={20} color="#64748b" />
    </View>
  );
}

function CategorySection({ icon, color, title, files }) {
  return (
    <View className="mt-6">
      <View className="flex-row items-center gap-2 mb-3">
        <MaterialIcons name={icon} size={18} color={color} />
        <Text className="text-base font-bold text-slate-900">
          {title}
        </Text>
      </View>

      {files.map((file, index) => (
        <FileItem key={index} {...file} />
      ))}
    </View>
  );
}
